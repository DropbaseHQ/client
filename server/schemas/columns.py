from datetime import datetime
from typing import List, Literal, Optional, Union
from uuid import UUID

from pydantic import BaseModel

from server.schemas.states import ColumnDisplayProperty, ColumnSharedProperty


class PgColumnBaseProperty(BaseModel):
    name: str
    type: Optional[
        Literal[
            "TEXT",
            "VARCHAR",
            "VARCHAR(255)",
            "CHAR",
            "CHARACTER",
            "STRING",
            "BINARY",
            "VARBINARY",
            "INTEGER",
            "INT",
            "BIGINT",
            "SMALLINT",
            "TINYINT",
            "BYTEINT",
            "REAL",
            "FLOAT",
            "FLOAT4",
            "FLOAT8",
            "DOUBLE",
            "DOUBLE PRECISION",
            "DECIMAL",
            "NUMERIC",
            "BOOLEAN",
            "DATE",
            "TIME",
            "DATETIME",
            "TIMESTAMP",
            "TIMESTAMP_LTZ",
            "TIMESTAMP_NTZ",
            "TIMESTAMP_TZ",
            "VARIANT",
            "OBJECT",
            "ARRAY",
        ]
    ]

    schema_name: str = None
    table_name: str = None
    column_name: str = None

    primary_key: bool = False
    foreign_key: bool = False
    default: str = None
    nullable: bool = True
    unique: bool = False

    edit_keys: list = []


class PgDefinedColumnProperty(PgColumnBaseProperty, ColumnSharedProperty):
    pass


class PgReadColumnProperty(PgColumnBaseProperty, ColumnDisplayProperty, ColumnSharedProperty):
    pass


class PyColumnBaseProperty(BaseModel):
    name: str
    type: Optional[Literal["str", "int", "float", "bool"]]


class PyDefinedColumnProperty(PyColumnBaseProperty, ColumnSharedProperty):
    pass


class PyReadColumnProperty(PyColumnBaseProperty, ColumnDisplayProperty, ColumnSharedProperty):
    pass


class BaseColumns(BaseModel):
    name: Optional[str]
    property: Union[PgDefinedColumnProperty, PyColumnBaseProperty]
    table_id: UUID
    type: str

    class Config:
        orm_mode = True


class ReadColumns(BaseColumns):
    id: UUID
    name: str
    property: Union[PgReadColumnProperty, PyColumnBaseProperty]
    table_id: UUID
    type: str
    date: datetime


class CreateColumns(BaseModel):
    name: Optional[str]
    property: dict
    table_id: UUID
    type: str


class UpdateColumns(BaseModel):
    name: Optional[str]
    type: str
    property: dict


class UpdateColumnsRequest(BaseModel):
    table_id: UUID
    # table_sql: str
    columns: List[str]
    app_name: str
    page_name: str
    token: str


class SyncColumns(BaseModel):
    type: str
    table_id: UUID
    columns: List[str]
