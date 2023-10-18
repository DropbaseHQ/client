import asyncio
import functools
import logging
import random
import secrets
import sys
from datetime import datetime, timedelta
from enum import StrEnum
from urllib.parse import urljoin

import httpx
import websockets
from fastapi import Request, WebSocket, WebSocketDisconnect, status
from fastapi.responses import StreamingResponse
from starlette.background import BackgroundTask
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound, DataError
from pydantic import BaseModel

from server import crud
from server.utils.helper import raise_http_exception


logging.basicConfig(stream=sys.stdout, level=logging.INFO)


def _parse_proxy_name(name: str) -> (str, str):
    # returns (proxy type, token)
    return name.split()


def _clean_stale(func):
    @functools.wraps(func)
    def wrapped(self, *args, **kwargs):
        if self._should_clean():
            self.logger.info(
                f"Initiating clean (last clean at {self.last_clean.strftime('%m/%d/%Y, %H:%M:%S')})."
            )
            self._clean()
        return func(self, *args, **kwargs)
    return wrapped


class TunnelType(StrEnum):
    WORKER = "worker"
    LSP = "lsp"


class Tunnel(BaseModel):
    host: str
    port: int


class FRPClient(BaseModel):
    tunnels: dict[TunnelType, Tunnel] = {}
    last_ping: datetime


class _FRPClientManager:
    def __init__(self, port_min: int=20000, port_max: int=40000):
        self.logger = logging.getLogger("FRPClientManager")
        self.port_min = port_min
        self.port_max = port_max
        self.stale_time = timedelta(minutes=5)
        self.clean_interval = timedelta(hours=1)
        self.last_clean = datetime.now()
        self.clients: dict[str, FRPClient] = {}

    @_clean_stale
    def handle_client_ping(self, token: str):
        client = self.clients.get(token)
        if client:
            client.last_ping = datetime.now()
            self.logger.info(f"Client \"{token}\" pinged.")
        else:
            self.logger.error(f"Ping failed: client \"{token}\" does not exist.")
            raise KeyError

    @_clean_stale
    def get_tunnel(self, token: str, type: TunnelType) -> tuple[str, int] | None:
        try:
            client = self.clients[token]
            tunnel = client.tunnels[type]
            self.logger.info(f"Got tunnel \"{type}\" from client \"{token}\".")
            return (tunnel.host, tunnel.port)
        except KeyError:
            self.logger.error(f"Failed to get tunnel \"{type}\" from client \"{token}\".")
            return (None, None)

    @_clean_stale
    def add_tunnel(self, token: str, *, type: TunnelType, host: str, port: int):
        if not self.clients.get(token):
            self.clients[token] = FRPClient(last_ping=datetime.now())
            self.logger.info(f"Registered client \"{token}\".")
        client = self.clients[token]
        client.tunnels[type] = Tunnel(host=host, port=port)
        self.logger.info(f"Created tunnel \"{type}\" from client \"{token}\".")
    
    @_clean_stale
    def remove_tunnel(self, token: str, *, type: TunnelType):
        try:
            client = self.clients[token]
            del client.tunnels[type]
            self.logger.info(f"Removed tunnel \"{type}\" from client \"{token}\".")
        except KeyError:
            self.logger.error(f"Failed to remove tunnel \"{type}\" from client \"{token}\": not found.")
    
    def choose_port(self) -> int:
        return random.randint(self.port_min, self.port_max)

    def _should_clean(self) -> bool:
        return datetime.now() - self.last_clean > self.clean_interval

    def _is_stale(self, client: FRPClient) -> bool:
        return not client.tunnels or (datetime.now() - client.last_ping > self.stale_time)
    
    def _clean(self):
        stale_client_tokens = []
        for token, client in self.clients.items():
            if self._is_stale(client):
                stale_client_tokens.append(token)
        for token in stale_client_tokens:
            self.clients.pop(token, None)
            self.logger.info(f"Removed client \"{token}\".")
        self.last_clean = datetime.now()


class ExposedWebSocket(BaseModel):
    url: str
    ttl: timedelta
    created_time: datetime


class _ExposedWebSocketManager:
    def __init__(self):
        self.logger = logging.getLogger("ExposedWebSocketManager")
        self.clean_interval = timedelta(hours=2)
        self.last_clean = datetime.now()
        self.websockets: dict[str, ExposedWebSocket] = {}
    
    @_clean_stale
    def add(self, url: str, ttl: timedelta=timedelta(minutes=30), nonce_bytes=64) -> str:
        nonce = secrets.token_urlsafe(nonce_bytes)
        self.websockets[nonce] = ExposedWebSocket(url=url, ttl=ttl, created_time=datetime.now())
        self.logger.info(f"Exposed ws endpoint {url} to ws://0.0.0.0/tunnel/{nonce}")
        return nonce
    
    @_clean_stale
    def pop(self, nonce: str, default=None) -> str:
        ws = self.websockets.pop(nonce, default)
        if ws:
            self.logger.info(f"Popped endpoint ws://0.0.0.0/tunnel/{nonce}")
            return ws.url
        else:
            return default

    def _should_clean(self) -> bool:
        return datetime.now() - self.last_clean > self.clean_interval

    def _is_stale(self, ws: ExposedWebSocket) -> bool:
        return datetime.now() - ws.created_time > ws.ttl
    
    def _clean(self):
        stale_nonces = []
        for nonce, ws in self.websockets.items():
            if self._is_stale(ws):
                stale_nonces.append(nonce)
        for nonce in stale_nonces:
            self.websockets.pop(nonce, None)
            self.logger.info(f"Removed endpoint ws://0.0.0.0/tunnel/{nonce}")
        self.last_clean = datetime.now()


TUNNEL_MANAGER = _FRPClientManager()
EXPOSED_WEBSOCKETS = _ExposedWebSocketManager()
FRPS_HOST = "127.0.0.1"


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
    type = _parse_proxy_name(content["proxy_name"])[0]
    port = TUNNEL_MANAGER.choose_port()

    TUNNEL_MANAGER.add_tunnel(
        token,
        type=type,
        port=port,
        host=FRPS_HOST,
    )

    content["remote_port"] = port
    return {
        "unchange": False,
        "content": content,
    }


def close_tunnel_op(request: dict):
    token = _get_token(request)
    content = request["content"]
    type = _parse_proxy_name(content["proxy_name"])[0]

    TUNNEL_MANAGER.remove_tunnel(
        token,
        type=type
    )

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
    workspace_id: str,
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
    
    # TODO use https
    #      although not needed, host should always be 127.0.0.1
    #      and frp automatically uses TLS.
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
    nonce = EXPOSED_WEBSOCKETS.add(url, timedelta(minutes=30))
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
