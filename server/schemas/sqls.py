from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class BaseSQLs(BaseModel):
    code: str
    app_id: UUID
    dataclass: Optional[str]
    table_meta: Optional[dict]


class ReadSQLs(BaseSQLs):
    id: UUID
    date: datetime


class CreateSQLs(BaseSQLs):
    pass


class UpdateSQLs(BaseModel):
    code: Optional[str]
    app_id: Optional[UUID]
    dataclass: Optional[str]
    table_meta: Optional[dict]


class QueryTable(BaseModel):
    app_id: UUID
    filters: Optional[List[dict]]
    sorts: Optional[List[dict]]
