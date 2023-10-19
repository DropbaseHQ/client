import logging
import secrets
from datetime import datetime, timedelta

from server.schemas.tunnel import ExposedWebSocket
from server.controllers.tunnel.manager_util import clean_stale


class _ExposedWebSocketManager:
    def __init__(self):
        self.logger = logging.getLogger("ExposedWebSocketManager")
        self.clean_interval = timedelta(hours=2)
        self.last_clean = datetime.now()
        self.websockets: dict[str, ExposedWebSocket] = {}
    
    @clean_stale
    def add(self, url: str, ttl: timedelta=timedelta(minutes=30), nonce_bytes=64) -> str:
        nonce = secrets.token_urlsafe(nonce_bytes)
        self.websockets[nonce] = ExposedWebSocket(url=url, ttl=ttl, created_time=datetime.now())
        self.logger.info(f"Exposed ws endpoint {url} to ws://0.0.0.0/tunnel/{nonce}")
        return nonce
    
    @clean_stale
    def pop(self, nonce: str, default=None) -> str:
        ws = self.websockets.pop(nonce, default)
        if ws:
            self.logger.info(f"Popped endpoint ws://0.0.0.0/tunnel/{nonce}")
            return ws.url
        else:
            return default

    def get_last_clean(self) -> str:
        return self.last_clean.strftime("%m/%d/%Y, %H:%M:%S")

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


EXPOSED_WEBSOCKETS = _ExposedWebSocketManager()
