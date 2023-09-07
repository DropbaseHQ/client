from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class BaseSQLs(BaseModel):
    name: str
    code: str
    page_id: UUID
    property: Optional[dict]
    dataclass: Optional[str]

    class Config:
        orm_mode = True


class ReadSQLs(BaseSQLs):
    id: UUID
    date: datetime


class CreateSQLs(BaseSQLs):
    pass


class UpdateSQLs(BaseModel):
    code: Optional[str]
    page_id: Optional[UUID]
    property: Optional[dict]
    dataclass: Optional[str]


class QueryTable(BaseModel):
    page_id: UUID
    filters: Optional[List[dict]]
    sorts: Optional[List[dict]]
