from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.schemas.columns import PgColumn, PythonColumn

column_type_to_schema_mapper = {"postgres": PgColumn, "python": PythonColumn}


def get_row_schema(db: Session, table_id: UUID):
    # get columns
    columns = crud.columns.get_table_columns(db, table_id)
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


# model_str = get_pydantic_model(db, table_id)
# print(model_str)
