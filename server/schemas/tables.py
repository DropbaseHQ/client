from datetime import datetime
from typing import Annotated, Any, List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel

from server.controllers.state.models import TableDisplayProperty, TableSharedProperty
from server.schemas.pinned_filters import Filter, PinnedFilter, Sort
from server.schemas.properties import PropertyCategory


class TablesBaseProperty(BaseModel):
    filters: Optional[List[PinnedFilter]]

    # events
    on_row_change: Annotated[Optional[str], PropertyCategory.events]
    on_row_selection: Annotated[Optional[str], PropertyCategory.events]

    # other
    appears_after: Optional[str]


class TablesDefinedProperty(TablesBaseProperty, TableSharedProperty):
    pass


class TablesReadProperty(TablesBaseProperty, TableSharedProperty, TableDisplayProperty):
    pass


class BaseTables(BaseModel):
    name: str
    property: TablesDefinedProperty
    page_id: UUID

    class Config:
        orm_mode = True


class ReadTables(BaseModel):
    id: UUID
    name: str
    property: TablesReadProperty
    page_id: UUID
    depends_on: Optional[List[str]]
    date: datetime


class CreateTables(BaseModel):
    name: Optional[str]
    property: TablesBaseProperty
    page_id: UUID
    depends_on: Optional[List[str]]


class CreateTablesRequest(BaseModel):
    name: Optional[str]
    property: TablesBaseProperty
    page_id: UUID
    state: Optional[dict] = {}
    depends_on: Optional[List[str]]


class UpdateTablesRequest(BaseModel):
    name: str
    table_id: str
    file_id: str
    page_id: str
    property: dict
    # depends_on: Optional[List[str]]
    table_columns: Optional[List[str]]


class UpdateTables(BaseModel):
    name: Optional[str]
    property: TablesBaseProperty
    file_id: UUID
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
    state: Optional[dict]


class PinFilters(BaseModel):
    table_id: UUID
    filters: List[PinnedFilter]


class ConvertTable(BaseModel):
    user_sql: str
    column_names: list
    gpt_schema: dict
    db_schema: dict


class UpdateSmartTables(BaseModel):
    smart_columns: list
    table: dict
