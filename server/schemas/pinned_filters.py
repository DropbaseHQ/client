from datetime import datetime
from typing import Any, Optional, Union
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
