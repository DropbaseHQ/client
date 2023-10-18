from fastapi import APIRouter, Request, Depends, WebSocket

from sqlalchemy.orm import Session

import server.controllers.tunnel as tunnel_controller
from server.controllers.tunnel import TUNNEL_MANAGER, TunnelType
from server.utils.connect import get_db
from server.utils.authorization import RESOURCES, AuthZDepFactory


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
def root():
    return TUNNEL_MANAGER.clients


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

    # TODO investigate resource usage of this. FRP docs mention
    #      that it is expensive to have this plugin with many proxies.
    return tunnel_controller.close_tunnel_op(request)


@router.post("/ping")
def ping_tunnel_op(request: dict):
    # FRPS server plugin RPC endpoint
    # https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md
    return tunnel_controller.ping_tunnel_op(request)


@authed_router.api_route("/{workspace_id}/{tunnel_name}/{client_path:path}", methods=["POST", "GET", "PUT", "DELETE"])
async def forward_request_through_tunnel(
    workspace_id: str,
    tunnel_name: TunnelType,
    request: Request,
    client_path: str,
    db: Session=Depends(get_db)
):
    # Acts as a reverse-proxy that routes HTTP requests through a tunnels to a client
    return await tunnel_controller.forward_request_through_tunnel(workspace_id, tunnel_name, request, client_path, db)


@authed_router.websocket("/{workspace_id}/{tunnel_name}")
async def connect_websocket_through_tunnel(
    workspace_id: str,
    tunnel_name: TunnelType,
    ws: WebSocket,
    db: Session=Depends(get_db)
):
    return await tunnel_controller.connect_websocket_through_tunnel(db, workspace_id, tunnel_name, ws)
