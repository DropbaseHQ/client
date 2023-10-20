import logging
import random
from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.schemas.tunnel import TunnelType, Tunnel, FRPClient
from server.controllers.tunnel.manager_util import clean_stale


class _FRPClientManager:
    def __init__(self, port_min: int=20000, port_max: int=40000):
        self.logger = logging.getLogger("FRPClientManager")
        self.port_min = port_min
        self.port_max = port_max
        self.stale_time = timedelta(minutes=5)
        self.clean_interval = timedelta(hours=1)
        self.last_clean = datetime.now()
        self.clients: dict[str, FRPClient] = {}
    
    def get_tunnel_url(self, db: Session, workspace_id: UUID, type: TunnelType) -> str:
        token = crud.workspace.get_workspace_proxy_token(db, workspace_id)
        return self.get_tunnel(token, type)

    @clean_stale
    def handle_client_ping(self, token: str):
        client = self.clients.get(token)
        if client:
            client.last_ping = datetime.now()
            self.logger.info(f"Client \"{token}\" pinged.")
        else:
            self.logger.error(f"Ping failed: client \"{token}\" does not exist.")
            raise KeyError

    @clean_stale
    def get_tunnel(self, token: str, type: TunnelType) -> tuple[str, int] | None:
        try:
            client = self.clients[token]
            tunnel = client.tunnels[type]
            self.logger.info(f"Got tunnel \"{type}\" from client \"{token}\".")
            return (tunnel.host, tunnel.port)
        except KeyError:
            self.logger.error(f"Failed to get tunnel \"{type}\" from client \"{token}\".")
            return (None, None)

    @clean_stale
    def add_tunnel(self, token: str, *, type: TunnelType, host: str, port: int):
        try:
            TunnelType(type)
        except ValueError as e:
            error_msg = f"{e}. Must be one of: {', '.join([e.value for e in TunnelType])}"
            self.logger.error(error_msg)
            raise ValueError(error_msg)
        if not self.clients.get(token):
            self.clients[token] = FRPClient(last_ping=datetime.now())
            self.logger.info(f"Registered client \"{token}\".")
        client = self.clients[token]
        client.tunnels[type] = Tunnel(host=host, port=port)
        self.logger.info(f"Created tunnel \"{type}\" from client \"{token}\".")
    
    @clean_stale
    def remove_tunnel(self, token: str, *, type: TunnelType):
        try:
            client = self.clients[token]
            del client.tunnels[type]
            self.logger.info(f"Removed tunnel \"{type}\" from client \"{token}\".")
        except KeyError:
            self.logger.error(f"Failed to remove tunnel \"{type}\" from client \"{token}\": not found.")
            raise KeyError
    
    def choose_port(self) -> int:
        return random.randint(self.port_min, self.port_max)

    def get_last_clean(self) -> str:
        return self.last_clean.strftime("%m/%d/%Y, %H:%M:%S")

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
