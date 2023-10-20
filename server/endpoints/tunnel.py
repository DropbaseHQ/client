from fastapi import APIRouter, Request, Depends, WebSocket

from sqlalchemy.orm import Session

import server.controllers.tunnel as tunnel_controller
from server.controllers.tunnel import EXPOSED_WEBSOCKETS, TUNNEL_MANAGER, TunnelType
from server.models import User
from server.utils.authorization import RESOURCES, AuthZDepFactory, get_current_user
from server.utils.connect import get_db
from server.utils.helper import raise_http_exception


workspace_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.WORKSPACE)

router = APIRouter(
    prefix="/tunnel",
    tags=["tunnel"],
)

authed_router = APIRouter(
    prefix="/tunnel",
    tags=["tunnel"],
    dependencies=[Depends(workspace_authorizer)],
)


@router.get("/clients")
def clients(user: User=Depends(get_current_user)):
    if user.email == "az@dropbase.io":
        return TUNNEL_MANAGER.clients
    else:
        raise_http_exception(401, "")


@router.get("/exposed_websockets")
def exposed_websockets(user: User=Depends(get_current_user)):
    if user.email == "az@dropbase.io":
        return EXPOSED_WEBSOCKETS.websockets
    else:
        raise_http_exception(401, "")


@router.post("/auth")
def auth_tunnel_op(request: dict, db: Session=Depends(get_db)):
    # FRPS server plugin RPC endpoint
    # https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md
    return tunnel_controller.auth_tunnel_op(db, request)


@router.post("/new")
def new_tunnel_op(request: dict):
    # FRPS server plugin RPC endpoint
    # https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md
    return tunnel_controller.new_tunnel_op(request)


@router.post("/close")
def close_tunnel_op(request: dict):
    # FRPS server plugin RPC endpoint
    # https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md
    return tunnel_controller.close_tunnel_op(request)


@router.post("/ping")
def ping_tunnel_op(request: dict):
    # FRPS server plugin RPC endpoint
    # https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md
    return tunnel_controller.ping_tunnel_op(request)


@authed_router.api_route("/http/{workspace_id}/{tunnel_name}/{client_path:path}", methods=["POST", "GET", "PUT", "DELETE"])
async def forward_request_through_tunnel(
    workspace_id: str,
    tunnel_name: TunnelType,
    request: Request,
    client_path: str,
    db: Session=Depends(get_db)
):
    # Acts as a reverse-proxy that routes HTTP requests through a tunnels to a client
    return await tunnel_controller.forward_request_through_tunnel(workspace_id, tunnel_name, request, client_path, db)


@authed_router.get("/ws/{workspace_id}/{tunnel_name}")
def generate_ws_url(
    request: Request,
    workspace_id: str,
    tunnel_name: TunnelType,
    db: Session=Depends(get_db)
):
    return tunnel_controller.generate_ws_url(db, request, workspace_id, tunnel_name)


@router.websocket("/{nonce}")
async def connect_websocket_through_tunnel(ws: WebSocket, nonce: str):
    return await tunnel_controller.connect_websocket_through_tunnel(ws, nonce)