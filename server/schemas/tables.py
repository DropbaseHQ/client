from datetime import datetime
from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TableDisplayProperty(BaseModel):
    message: Optional[str]
    message_type: Optional[str]


class TableColumnStateProperty(TableDisplayProperty):
    pass


class TablesBaseProperty(BaseModel):
    # read_only
    # ui
    code: str = Field(..., description="sql")
    type: Literal["postgres", "python"]
    name: str

    # on row change
    on_change: Optional[str]


class TablesProperty(TablesBaseProperty, TableDisplayProperty):
    pass


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
    property: TablesBaseProperty
    page_id: UUID


class UpdateTables(BaseModel):
    name: Optional[str]
    property: TablesBaseProperty


class QueryTable(BaseModel):
    table_id: UUID
    filters: Optional[List[dict]]
    sorts: Optional[List[dict]]
