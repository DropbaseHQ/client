import functools
import random
from datetime import datetime, timedelta
from enum import StrEnum

from pydantic import BaseModel


def _parse_proxy_name(name: str) -> (str, str):
    # returns (proxy type, token)
    return name.split()


def _clean_stale_clients(func):
    @functools.wraps(func)
    def wrapped(self, *args, **kwargs):
        print(self.clients)
        if self._should_clean():
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
        self.port_min = port_min
        self.port_max = port_max
        self.stale_time = timedelta(minutes=5)
        self.clean_interval = timedelta(minutes=30)
        self.last_clean = datetime.now()
        self.clients: dict[str, FRPClient] = {}

    @_clean_stale_clients
    def handle_client_ping(self, token: str):
        client = self.clients.get(token)
        if client:
            client.last_ping = datetime.now()

    @_clean_stale_clients
    def get_tunnel(self, token: str, type: TunnelType) -> tuple[str, int] | None:
        try:
            client = self.clients[token]
            tunnel = client.tunnels[type]
            return (tunnel.host, tunnel.port)
        except KeyError:
            return None

    @_clean_stale_clients
    def add_tunnel(self, token: str, *, type: TunnelType, host: str, port: int):
        if not self.clients.get(token):
            self.clients[token] = FRPClient(last_ping=datetime.now())
        try:
            client = self.clients[token]
            client.tunnels[type] = Tunnel(host=host, port=port)
        except KeyError:
            pass
    
    @_clean_stale_clients
    def remove_tunnel(self, token: str, *, type: TunnelType):
        try:
            client = self.clients[token]
            client.tunnels.pop(type, None)
        except KeyError:
            pass
    
    def choose_port(self) -> int:
        return random.randint(self.port_min, self.port_max)

    def _should_clean(self) -> bool:
        return datetime.now() - self.last_clean > self.clean_interval

    def _is_stale(self, client: FRPClient) -> bool:
        return not client.tunnels or (datetime.now() - client.last_ping > self.stale_time)
    
    def _clean(self):
        for token, client in self.clients.items():
            if self._is_stale(client):
                self.clients.pop(token, None)


CLIENT_MANAGER = _FRPClientManager()
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


def auth_tunnel_op(request: dict):
    token = _get_token(request)
    # TODO auth from tokens in db
    if token in ["test-token", "test-token2"]:
        return {"unchange": True}
    else:
        return {
            "reject": True,
            "reject_reason": "auth failure.",
        }


def new_tunnel_op(request: dict):
    token = _get_token(request)
    content = request["content"]
    type = _parse_proxy_name(content["proxy_name"])[0]
    port = CLIENT_MANAGER.choose_port()

    CLIENT_MANAGER.add_tunnel(
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

    CLIENT_MANAGER.remove_tunnel(
        token,
        type=type
    )

    return {"unchange": True}


def ping_tunnel_op(request: dict):
    token = _get_token(request)

    CLIENT_MANAGER.handle_client_ping(token)

    return {"unchange": True}
