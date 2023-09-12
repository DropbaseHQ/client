from server import crud
from server.schemas.columns import PgColumn, PythonColumn
from server.utils.helper import clean_name_for_class

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
    model_name = clean_name_for_class(table.name)
    model_str = f"class {model_name}(BaseModel):\n"
    for col in columns:
        ColumnModel = columns_type_mapper[col.type]
        column = ColumnModel(**col.property)
        type = pg_pydantic_dtype_mapper.get(column.type)
        model_str += f"    {column.name}: {type if type else 'Any'}\n"

    return model_str, model_name


from typing import TypedDict, Any

from sqlalchemy import inspect
from sqlalchemy.sql import text


# {schema: {table: {column: {property: ...}}}}
FullDBSchema = dict[str, dict[str, dict[str, dict[str, Any]]]]

# {schema: {table: [column names...]}}
GPTDBSchema = dict[str, dict[str, list[str]]]

class DBSchemaMetadata(TypedDict):
    default_schema: str


class GPTSchema(TypedDict):
    metadata: DBSchemaMetadata
    schema: GPTDBSchema


def get_db_schema(user_db_engine) -> (FullDBSchema, GPTSchema):
    inspector = inspect(user_db_engine)
    schemas = inspector.get_schema_names()
    default_search_path = inspector.default_schema_name

    db_schema: FullDBSchema = {}
    gpt_schema: GPTSchema = {
        "metadata": {
            "default_schema": default_search_path,
        },
        "schema": {},
    }

    for schema in schemas:
        if schema == "information_schema":
            continue
        tables = inspector.get_table_names(schema=schema)
        gpt_schema["schema"][schema] = {}
        db_schema[schema] = {}

        for table_name in tables:
            columns = inspector.get_columns(table_name, schema=schema)
            primary_key = set().union(inspector.get_pk_constraint(table_name, schema=schema)["constrained_columns"])

            foreign_keys = set()
            for fk_constraint in inspector.get_foreign_keys(table_name, schema=schema):
                fk_constraint_cols = fk_constraint["constrained_columns"]
                foreign_keys = foreign_keys.union(fk_constraint_cols)

            unique_cols = set()
            for unique_constraint in inspector.get_unique_constraints(table_name, schema=schema):
                unique_constraint_cols = unique_constraint["column_names"]
                unique_cols = unique_cols.union(unique_constraint_cols)

            db_schema[schema][table_name] = {}
            for column in columns:
                col_name = column["name"]
                is_pk = col_name in primary_key
                db_schema[schema][table_name][col_name] = {
                    "schema_name": schema,
                    "table_name": table_name,
                    "column_name": col_name,
                    "type": str(column["type"]),
                    "nullable": column["nullable"],
                    "unique": is_pk or col_name in unique_cols,
                    "primary_key": is_pk,
                    "foreign_key": col_name in foreign_keys,
                    "default": column["default"],
                }
            gpt_schema["schema"][schema][table_name] = [column["name"] for column in columns]

    return db_schema, gpt_schema


def get_column_names(user_db_engine, user_sql: str) -> list[str]:
    if user_sql == "":
        return []
    user_sql = user_sql.strip("\n ;")
    user_sql = f"SELECT * FROM ({user_sql}) AS q LIMIT 1"
    with user_db_engine.connect().execution_options(autocommit=True) as conn:
        col_names = list(conn.execute(text(user_sql)).keys())
    return col_names
