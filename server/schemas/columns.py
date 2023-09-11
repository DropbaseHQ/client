from datetime import datetime
from typing import Any, Literal, Optional, Union
from uuid import UUID

from pydantic import BaseModel

from server.schemas.states import PgColumnDisplayProperty, PgColumnSharedProperty


class PgColumnBaseProperty(BaseModel):
    name: str
    type: Optional[
        Literal[
            "TEXT",
            "VARCHAR",
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
    columns_name: str = None

    primary_key: bool = False
    foreign_key: bool = False
    default: str = None
    nullable: bool = True
    unique: bool = False


class PgDefinedColumnProperty(PgColumnBaseProperty, PgColumnSharedProperty):
    pass


class PgReadColumnProperty(PgColumnBaseProperty, PgColumnDisplayProperty, PgColumnSharedProperty):
    pass


class PythonColumn(BaseModel):
    name: str


class BaseColumns(BaseModel):
    name: Optional[str]
    property: Union[PgDefinedColumnProperty, PythonColumn]
    table_id: UUID
    type: str


class ReadColumns(BaseColumns):
    id: UUID
    name: str
    property: Union[PgReadColumnProperty, PythonColumn]
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
