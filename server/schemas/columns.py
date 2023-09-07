from datetime import datetime
from typing import Any, Literal, Optional, Union
from uuid import UUID

from pydantic import BaseModel

# pg_types = ["TEXT",
#             "VARCHAR",
#             "CHAR",
#             "CHARACTER",
#             "STRING",
#             "BINARY",
#             "VARBINARY",
#             "INTEGER",
#             "INT",
#             "BIGINT",
#             "SMALLINT",
#             "TINYINT",
#             "BYTEINT",
#             "REAL",
#             "FLOAT",
#             "FLOAT4",
#             "FLOAT8",
#             "DOUBLE",
#             "DOUBLE PRECISION",
#             "DECIMAL",
#             "NUMERIC",
#             "BOOLEAN",
#             "DATE",
#             "TIME",
#             "DATETIME",
#             "TIMESTAMP",
#             "TIMESTAMP_LTZ",
#             "TIMESTAMP_NTZ",
#             "TIMESTAMP_TZ",
#             "VARIANT",
#             "OBJECT",
#             "ARRAY"
#             ]


class PgColumn(BaseModel):
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

    # table display specific
    editable: bool = False
    hidden: bool = False

    class Config:
        orm_mode = True


class PythonColumn(BaseModel):
    name: str


class BaseColumns(BaseModel):
    property: Union[PgColumn, PythonColumn]
    table_id: UUID
    type: str


class ReadColumns(BaseColumns):
    id: UUID
    date: datetime


class CreateColumns(BaseModel):
    property: dict
    table_id: UUID
    type: str


class UpdateColumns(BaseModel):
    type: str
    property: dict
