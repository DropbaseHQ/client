from typing import Literal, Optional

from pydantic import BaseModel


# pg columns
class ColumnDisplayProperty(BaseModel):
    message: Optional[str]
    message_type: Optional[str]


class ColumnSharedProperty(BaseModel):
    editable: Optional[bool] = False
    visible: Optional[bool] = True


class PgColumnContextProperty(ColumnDisplayProperty, ColumnSharedProperty):
    pass


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
    column_name: str = None

    primary_key: bool = False
    foreign_key: bool = False
    default: str = None
    nullable: bool = True
    unique: bool = False

    edit_keys: list = []

    @property
    def state(self):
        match self.type:
            case "INTEGER" | "INT" | "BIGINT" | "SMALLINT" | "TINYINT" | "BYTEINT":
                return int
            case "REAL" | "FLOAT" | "FLOAT4" | "FLOAT8" | "DOUBLE" | "DOUBLE PRECISION" | "DECIMAL" | "NUMERIC":
                return float
            case "BOOLEAN":
                return bool
            case _:
                return str


class PgColumnDefinedProperty(PgColumnBaseProperty, ColumnSharedProperty):
    pass


class PyColumnContextProperty(ColumnDisplayProperty, ColumnSharedProperty):
    pass


class PyColumnBaseProperty(BaseModel):
    name: str
    type: Optional[Literal["str", "int", "float", "bool"]] = "str"

    @property
    def state(self):
        match self.type:
            case "int":
                return int
            case "float":
                return float
            case "bool":
                return bool
            case _:
                return str


class PyColumnDefinedProperty(PyColumnBaseProperty, ColumnSharedProperty):
    pass
