from datetime import datetime
from typing import Callable, List, Optional
from uuid import UUID

from pydantic import BaseModel


class TablesProperty(BaseModel):
    # read_only
    # ui
    code: str
    type: str
    name: str

    # on row change
    on_change: Optional[Callable[[int], int]]


class BaseTables(BaseModel):
    name: str
    property: TablesProperty
    page_id: UUID

    class Config:
        orm_mode = True


class ReadTables(BaseTables):
    id: UUID
    date: datetime


class CreateTables(BaseModel):
    name: Optional[str]
    property: TablesProperty
    page_id: UUID


class UpdateTables(BaseModel):
    name: Optional[str]
    property: TablesProperty


class QueryTable(BaseModel):
    page_id: UUID
    filters: Optional[List[dict]]
    sorts: Optional[List[dict]]
