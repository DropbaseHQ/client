from datetime import datetime
from typing import Any, List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from server.schemas.pinned_filters import Filter, PinnedFilter, Sort
from server.schemas.states import TableDisplayProperty, TableSharedProperty


class TablesBaseProperty(BaseModel):
    name: str
    # source: Optional[str]
    # type: Literal["postgres", "python"]
    code: str = Field(..., description="sql")
    filters: Optional[List[PinnedFilter]]

    # on row change
    on_change: Optional[str]

    appears_after: Optional[str]


class TablesDefinedProperty(TablesBaseProperty, TableSharedProperty):
    pass


class TablesReadProperty(TablesBaseProperty, TableSharedProperty, TableDisplayProperty):
    pass


class BaseTables(BaseModel):
    name: str
    property: TablesDefinedProperty
    page_id: UUID
    source_id: Optional[UUID]
    type: Optional[Literal["postgres", "python"]]

    class Config:
        orm_mode = True


class ReadTables(BaseModel):
    id: UUID
    name: str
    property: TablesReadProperty
    page_id: UUID
    source_id: Optional[UUID]
    type: Optional[Literal["postgres", "python"]]
    depends_on: Optional[List[str]]
    date: datetime


class CreateTables(BaseModel):
    name: Optional[str]
    property: TablesBaseProperty
    page_id: UUID
    source_id: Optional[UUID]
    type: Optional[Literal["postgres", "python"]] = "postgres"
    depends_on: Optional[List[str]]


class CreateTablesRequest(BaseModel):
    name: Optional[str]
    property: TablesBaseProperty
    page_id: UUID
    source_id: Optional[UUID]
    type: Optional[Literal["postgres", "python"]] = "postgres"
    state: Optional[dict] = {}
    depends_on: Optional[List[str]]


class UpdateTables(BaseModel):
    name: Optional[str]
    property: TablesBaseProperty
    source_id: UUID
    depends_on: Optional[List[str]]


class UpdateTablesRequest(BaseModel):
    name: Optional[str]
    property: TablesBaseProperty
    source_id: UUID
    page_id: UUID
    state: Optional[dict]
    depends_on: Optional[List[str]]


class QueryTable(BaseModel):
    table_id: UUID
    page_id: UUID
    filters: Optional[List[Filter]]
    sorts: Optional[List[Sort]]
    state: Optional[dict]


class QueryResponse(BaseModel):
    table_id: UUID
    table_name: str
    header: Optional[List[str]]
    data: Optional[List[List[Any]]]
    columns: Optional[dict]
    error: Optional[str] = ""


class ConvertToSmart(BaseModel):
    table_id: UUID


class PinFilters(BaseModel):
    table_id: UUID
    filters: List[PinnedFilter]
