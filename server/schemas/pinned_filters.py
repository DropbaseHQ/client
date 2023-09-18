from datetime import datetime
from typing import Any, Literal, Optional
from uuid import UUID

from pydantic import BaseModel


class BaseFilters(BaseModel):
    table_id: UUID
    filters: dict
    sorts: dict


class ReadFilters(BaseFilters):
    id: UUID
    date: datetime


class CreateFilters(BaseFilters):
    pass


class UpdateFilters(BaseModel):
    table_id: UUID
    filters: Optional[dict]
    sorts: Optional[dict]


class Filter(BaseModel):
    column_name: str
    # operator: Literal["and", "or", ""]
    condition: Literal["=", ">", "<", ">=", "<=", "like", "in"]
    value: Any


class Sort(BaseModel):
    column_name: str
    value: Literal["asc", "desc"]


class PinnedFilter(BaseModel):
    column_name: str
    # operator: Literal["and", "or", ""]
    condition: Literal["=", ">", "<", ">=", "<=", "like", "in"]
