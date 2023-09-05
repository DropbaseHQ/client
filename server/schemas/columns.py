from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class PgColumn(BaseModel):
    name: str
    type: str = None

    schema_name: str = None
    table_name: str = None
    columns_name: str = None

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


class PythonColumn(BaseModel):
    name: str


class BaseColumns(BaseModel):
    name: str
    property: Union[PgColumn, PythonColumn]
    table_id: UUID
    type: str


class ReadColumns(BaseColumns):
    id: UUID
    date: datetime


class CreateColumns(BaseModel):
    name: Optional[str]
    property: Union[PgColumn, PythonColumn]
    table_id: UUID
    type: str


class UpdateColumns(BaseModel):
    name: Optional[str]
    type: str
    property: Union[PgColumn, PythonColumn]
