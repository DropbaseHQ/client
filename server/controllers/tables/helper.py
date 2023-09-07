from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.schemas.columns import PgColumn, PythonColumn

column_type_to_schema_mapper = {"postgres": PgColumn, "python": PythonColumn}


def get_row_schema(columns):
    # convert to selected row input
    row_input = {}
    for column in columns:
        ColumnClass = column_type_to_schema_mapper[column.type]
        col = ColumnClass(**column.property)
        row_input[col.name] = None
    return row_input


columns_type_mapper = {"postgres": PgColumn}
pg_pydantic_dtype_mapper = {
    "TEXT": "str",
    "VARCHAR": "str",
    "CHAR": "str",
    "CHARACTER": "str",
    "STRING": "str",
    "BINARY": "str",
    "VARBINARY": "str",
    "INTEGER": "int",
    "INT": "int",
    "BIGINT": "int",
    "SMALLINT": "int",
    "TINYINT": "int",
    "BYTEINT": "int",
    "REAL": "real",
    "FLOAT": "real",
    "FLOAT4": "real",
    "FLOAT8": "real",
    "DOUBLE": "real",
    "DOUBLE PRECISION": "real",
    "DECIMAL": "real",
    "NUMERIC": "real",
    "BOOLEAN": "bool",
    "DATE": "str",
    "TIME": "str",
    "DATETIME": "str",
    "TIMESTAMP": "str",
    "TIMESTAMP_LTZ": "str",
    "TIMESTAMP_NTZ": "str",
    "TIMESTAMP_TZ": "str",
    "VARIANT": "str",
    "OBJECT": "str",
    "ARRAY": "str",
}


def get_table_pydantic_model(db, table_id):
    table = crud.tables.get_object_by_id_or_404(db, id=table_id)
    columns = crud.columns.get_table_columns(db, table_id)

    model_str = f"class {table.name.capitalize()}(BaseModel):\n"
    for col in columns:
        ColumnModel = columns_type_mapper[col.type]
        column = ColumnModel(**col.property)
        model_str += f"    {column.name}: {pg_pydantic_dtype_mapper[column.type]}\n"

    return model_str


from typing import TypedDict

from sqlalchemy import inspect
from sqlalchemy.sql import text


class GPTSchema(TypedDict):
    metadata: dict[str, str]
    schema: dict[str, dict[str, dict[str, dict]]]


def get_db_schema(user_db_engine) -> GPTSchema:
    inspector = inspect(user_db_engine)
    schemas = inspector.get_schema_names()
    default_search_path = inspector.default_schema_name

    database_structure: GPTSchema = {
        "metadata": {
            "default_schema": default_search_path,
        },
        "schema": {},
    }

    for schema in schemas:
        if schema == "information_schema":
            continue
        tables = inspector.get_table_names(schema=schema)
        schema_tables: dict[str, list[str]] = {}

        for table_name in tables:
            columns = inspector.get_columns(table_name, schema=schema)
            column_names = [column["name"] for column in columns]
            schema_tables[table_name] = column_names
        database_structure["schema"][schema] = schema_tables

    # TODO also return full schema (all column metadata)
    return database_structure


def get_column_names(user_db_engine, user_sql: str) -> list[str]:
    if user_sql == "":
        return []
    user_sql = user_sql.strip("\n ;")
    user_sql = f"SELECT * FROM ({user_sql}) AS q LIMIT 1"
    with user_db_engine.connect().execution_options(autocommit=True) as conn:
        col_names = list(conn.execute(text(user_sql)).keys())
    return col_names
