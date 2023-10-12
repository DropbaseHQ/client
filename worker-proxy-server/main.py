from fastapi import FastAPI

import controller

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Dropbase worker proxy backend"}

@app.post("/tunnel/auth")
def auth_tunnel_op(request: dict):
    # FRPS server plugin RPC endpoint
    # https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md
    return controller.auth_tunnel_op(request)


@app.post("/tunnel/new")
def new_tunnel_op(request: dict):
    # FRPS server plugin RPC endpoint
    # https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md
    return controller.new_tunnel_op(request)


@app.post("/tunnel/close")
def close_tunnel_op(request: dict):
    # FRPS server plugin RPC endpoint
    # https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md

    # TODO investigate resource usage of this. FRP docs mention
    #      that it is expensive to have this plugin with many proxies.
    return controller.close_tunnel_op(request)


@app.post("/tunnel/ping")
def ping_tunnel_op(request: dict):
    # FRPS server plugin RPC endpoint
    # https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md
    return controller.ping_tunnel_op(request)
