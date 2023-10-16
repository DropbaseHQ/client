from fastapi import APIRouter

import server.controllers.tunnel as tunnel_controller
from server.controllers.tunnel import TUNNEL_MANAGER


router = APIRouter(
    prefix="/tunnel",
    tags=["tunnel"],
)


@router.get("/clients")
def root():
    return TUNNEL_MANAGER.clients


@router.post("/auth")
def auth_tunnel_op(request: dict):
    # FRPS server plugin RPC endpoint
    # https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md
    return tunnel_controller.auth_tunnel_op(request)


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
