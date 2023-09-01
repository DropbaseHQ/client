from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class BaseTables(BaseModel):
    name: str
    property: Optional[dict]
    page_id: UUID

    class Config:
        orm_mode = True


class ReadTables(BaseTables):
    id: UUID
    date: datetime


class CreateTables(BaseTables):
    pass


class UpdateTables(BaseModel):
    property: Optional[dict]


class QueryTable(BaseModel):
    page_id: UUID
    filters: Optional[List[dict]]
    sorts: Optional[List[dict]]
