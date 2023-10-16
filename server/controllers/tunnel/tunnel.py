import functools
import logging
import random
import sys
from datetime import datetime, timedelta
from enum import StrEnum

from pydantic import BaseModel


logging.basicConfig(stream=sys.stdout, level=logging.INFO)


def _parse_proxy_name(name: str) -> (str, str):
    # returns (proxy type, token)
    return name.split()


def _clean_stale_clients(func):
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
        self.clean_interval = timedelta(minutes=30)
        self.last_clean = datetime.now()
        self.clients: dict[str, FRPClient] = {}

    @_clean_stale_clients
    def handle_client_ping(self, token: str):
        client = self.clients.get(token)
        if client:
            client.last_ping = datetime.now()
            self.logger.info(f"Client \"{token}\" pinged.")
        else:
            self.logger.error(f"Ping failed: client \"{token}\" does not exist.")
            raise KeyError

    @_clean_stale_clients
    def get_tunnel(self, token: str, type: TunnelType) -> tuple[str, int] | None:
        try:
            client = self.clients[token]
            tunnel = client.tunnels[type]
            self.logger.info(f"Got tunnel \"{type}\" from client \"{token}\".")
            return (tunnel.host, tunnel.port)
        except KeyError:
            self.logger.error(f"Failed to get tunnel \"{type}\" from client \"{token}\".")

    @_clean_stale_clients
    def add_tunnel(self, token: str, *, type: TunnelType, host: str, port: int):
        if not self.clients.get(token):
            self.clients[token] = FRPClient(last_ping=datetime.now())
            self.logger.info(f"Registered client \"{token}\".")
        client = self.clients[token]
        client.tunnels[type] = Tunnel(host=host, port=port)
        self.logger.info(f"Created tunnel \"{type}\" from client \"{token}\".")
    
    @_clean_stale_clients
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


TUNNEL_MANAGER = _FRPClientManager()
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
