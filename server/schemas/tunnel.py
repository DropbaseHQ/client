from datetime import datetime, timedelta
from enum import StrEnum

from pydantic import BaseModel


class TunnelType(StrEnum):
    WORKER = "worker"
    LSP = "lsp"


class Tunnel(BaseModel):
    host: str
    port: int


class FRPClient(BaseModel):
    tunnels: dict[TunnelType, Tunnel] = {}
    last_ping: datetime


class ExposedWebSocket(BaseModel):
    url: str
    ttl: timedelta
    created_time: datetime
