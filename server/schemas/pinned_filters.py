from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID

from pydantic import BaseModel


class BaseFilters(BaseModel):
    sql_id: UUID
    filters: dict
    sorts: dict


class ReadFilters(BaseFilters):
    id: UUID
    date: datetime


class CreateFilters(BaseFilters):
    pass


class UpdateFilters(BaseModel):
    sql_id: UUID
    filters: Optional[dict]
    sorts: Optional[dict]


class Filter(BaseModel):
    column_name: str
    operator: str
    value: Any


class Sort(BaseModel):
    column_name: str
    value: str
