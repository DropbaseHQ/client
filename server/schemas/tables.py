from datetime import datetime
from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from server.schemas.pinned_filters import Filter, Sort
from server.schemas.states import TableDisplayProperty, TableSharedProperty


class TablesBaseProperty(BaseModel):
    name: str
    source: Optional[str]
    code: str = Field(..., description="sql")
    type: Literal["postgres", "python"]

    # on row change
    on_change: Optional[str]


class TablesDefinedProperty(TablesBaseProperty, TableSharedProperty):
    pass


class TablesReadProperty(TablesBaseProperty, TableSharedProperty, TableDisplayProperty):
    pass


class BaseTables(BaseModel):
    name: str
    property: TablesDefinedProperty
    page_id: UUID


class ReadTables(BaseModel):
    id: UUID
    name: str
    property: TablesReadProperty
    page_id: UUID
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
    filters: Optional[List[Filter]]
    sorts: Optional[List[Sort]]


class ConvertToSmart(BaseModel):
    table_id: UUID
