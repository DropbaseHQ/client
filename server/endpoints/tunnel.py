from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.controllers import tunnel
from server.utils.connect import get_db


router = APIRouter(
    prefix="/tunnel",
    tags=["tunnel"],
)


@router.post("/auth")
def auth_tunnel_op(request: dict, db: Session = Depends(get_db)):
    # FRPS server plugin RPC endpoint
    # https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md
    return tunnel.auth_tunnel_op(request, db)


@router.post("/new")
def new_tunnel_op(request: dict):
    # FRPS server plugin RPC endpoint
    # https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md
    return tunnel.new_tunnel_op(request)


@router.post("/close")
def close_tunnel_op(request: dict):
    # FRPS server plugin RPC endpoint
    # https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md

    # TODO investigate resource usage of this. FRP docs mention
    #      that it is expensive to have this plugin with many proxies.
    return tunnel.close_tunnel_op(request)


@router.post("/ping")
def ping_tunnel_op(request: dict):
    # FRPS server plugin RPC endpoint
    # https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md
    return tunnel.ping_tunnel_op(request)
