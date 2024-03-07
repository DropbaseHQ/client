from pydantic import BaseModel
from typing import Optional


class BaseURLMapping(BaseModel):
    id: str
    name: Optional[str]
    client_url: Optional[str]
    worker_url: Optional[str]
    worker_ws_url: Optional[str]
    date: str


class ReadURLMapping(BaseURLMapping):
    pass


class CreateURLMapping(BaseModel):
    name: Optional[str]
    client_url: Optional[str]
    worker_url: Optional[str]
    worker_ws_url: Optional[str]


class UpdateURLMapping(BaseModel):
    name: Optional[str]
    client_url: Optional[str]
    worker_url: Optional[str]
    worker_ws_url: Optional[str]


class DeleteURLMapping(BaseModel):
    id: str
