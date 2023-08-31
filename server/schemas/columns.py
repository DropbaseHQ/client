from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class BaseColumns(BaseModel):
    name: str
    property: Optional[dict]
    sql_id: UUID


class ReadColumns(BaseColumns):
    id: UUID
    date: datetime


class CreateColumns(BaseColumns):
    pass


class UpdateColumns(BaseModel):
    property: Optional[dict]


class PgColumn(BaseModel):
    name: str
    type: str = None
    primary_key: bool = False
    foreign_key: bool = False
    default: Any = None
    nullable: bool = True
    unique: bool = False

    # table display specific
    editable: bool = False
    hidden: bool = False
    key_column: str = None

    class Config:
        orm_mode = True
