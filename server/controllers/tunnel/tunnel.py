import asyncio
from urllib.parse import urljoin

import httpx
import websockets
from fastapi import Request, WebSocket, WebSocketDisconnect, status
from fastapi.responses import StreamingResponse
from starlette.background import BackgroundTask
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound, DataError

from server import crud
from server.utils.helper import raise_http_exception
from server.schemas.tunnel import TunnelType
from server.controllers.tunnel.frpc_client_manager import TUNNEL_MANAGER
from server.controllers.tunnel.exposed_websocket_manager import EXPOSED_WEBSOCKETS


FRPS_HOST = "127.0.0.1"


def _parse_proxy_name(name: str) -> (str, TunnelType):
    # returns (token, TunnelType)
    return name.split("/")[1]


def _get_token(request: dict) -> str | None:
    try:
        if request["op"] == "Login":
            metadata = request["content"]["metas"]
        else:
            metadata = request["content"]["user"]["metas"]
        return metadata.get("token")
    except KeyError:
        return None


def auth_tunnel_op(db: Session, request: dict):
    token = _get_token(request)
    try:
        crud.workspace.get_workspace_by_proxy_token(db, token)
    except NoResultFound:
        return {
            "reject": True,
            "reject_reason": "auth failure.",
        }
    else:
        return {"unchange": True}


def new_tunnel_op(request: dict):
    token = _get_token(request)
    content = request["content"]
    type = _parse_proxy_name(content["proxy_name"])
    port = TUNNEL_MANAGER.choose_port()

    try:
        TUNNEL_MANAGER.add_tunnel(
            token,
            type=type,
            port=port,
            host=FRPS_HOST,
        )
    except ValueError as e:
        return {
            "reject": True,
            "reject_reason": str(e),
        }

    content["remote_port"] = port
    return {
        "unchange": False,
        "content": content,
    }


def close_tunnel_op(request: dict):
    token = _get_token(request)
    content = request["content"]
    type = _parse_proxy_name(content["proxy_name"])

    try:
        TUNNEL_MANAGER.remove_tunnel(
            token,
            type=type
        )
    except KeyError:
        return {
            "reject": True,
            "reject_reason": f"Failed to remove tunnel \"{type}\" from client \"{token}\": not found.",
        }
    else:
        return {"unchange": True}


def ping_tunnel_op(request: dict):
    token = _get_token(request)

    try:
        TUNNEL_MANAGER.handle_client_ping(token)
    except KeyError:
        return {
            "reject": True,
            "reject_reason": "ping failed, frpc not registeered.",
        }
    else:
        return {"unchange": True}


async def forward_request_through_tunnel(
    workspace_id: str,  # TODO change this to UUID
    tunnel_name: TunnelType,
    request: Request,
    client_path: str,
    db: Session
):
    try:
        token = crud.workspace.get_workspace_proxy_token(db, workspace_id)
    except (NoResultFound, DataError) as e:
        raise_http_exception(404, f"workspace {workspace_id} not found", e)

    host, port = TUNNEL_MANAGER.get_tunnel(token, tunnel_name)

    if not host or not port:
        raise_http_exception(404, f"tunnel \"{tunnel_name}\" not found for workspace {workspace_id}")

    url = urljoin(f"http://{host}:{port}/", client_path)

    async with httpx.AsyncClient() as client:
        req = client.build_request(
            method=request.method,
            url=url,
            headers=request.headers.raw,
            content=request.stream(),
        )
        res = await client.send(req, stream=True)
        return StreamingResponse(
            content=res.aiter_raw(),
            status_code=res.status_code,
            headers=res.headers,
            background=BackgroundTask(res.aclose),
        )


def generate_ws_url(db: Session, request: Request, workspace_id: str, tunnel_name: str):
    try:
        token = crud.workspace.get_workspace_proxy_token(db, workspace_id)
    except (NoResultFound, DataError) as e:
        raise_http_exception(404, f"workspace {workspace_id} not found", e)
    host, port = TUNNEL_MANAGER.get_tunnel(token, tunnel_name)

    if not host or not port:
        raise_http_exception(404, f"tunnel \"{tunnel_name}\" not found for workspace {workspace_id}")

    url = f"ws://{host}:{port}/"
    nonce = EXPOSED_WEBSOCKETS.add(url)
    return {"url": f"ws://{request.url.netloc}/tunnel/{nonce}"}


async def ws_forward(ws_a: WebSocket, ws_b: websockets.WebSocketClientProtocol):
    while True:
        data = await ws_a.receive_bytes()
        await ws_b.send(data)


async def ws_reverse(ws_a: WebSocket, ws_b: websockets.WebSocketClientProtocol):
    while True:
        data = await ws_b.recv()
        await ws_a.send_text(data)


async def connect_websocket_through_tunnel(ws: WebSocket, nonce: str):
    await ws.accept()

    url = EXPOSED_WEBSOCKETS.pop(nonce)
    if not url:
        await ws.close(code=status.WS_1008_POLICY_VIOLATION, reason="not found")
        return

    try:
        async with websockets.connect(url) as ws_client:
            fwd_task = asyncio.create_task(ws_forward(ws, ws_client))
            rev_task = asyncio.create_task(ws_reverse(ws, ws_client))
            await asyncio.gather(fwd_task, rev_task)
    except WebSocketDisconnect:
        pass
