from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class BaseColumns(BaseModel):
    name: Optional[str]
    property: dict
    table_id: UUID
    type: str

    class Config:
        orm_mode = True


class ReadColumns(BaseColumns):
    id: UUID
    name: str
    property: dict
    table_id: UUID
    type: str
    date: datetime


class CreateColumns(BaseModel):
    name: Optional[str]
    property: dict
    table_id: UUID
    type: str


class UpdateColumns(BaseModel):
    name: Optional[str]
    type: str
    property: dict


class UpdateColumnsRequest(BaseModel):
    table_id: UUID
    # table_sql: str
    columns: List[str]
    app_name: str
    page_name: str
    token: str


class SyncColumns(BaseModel):
    type: str
    table_id: UUID
    columns: List[str]
