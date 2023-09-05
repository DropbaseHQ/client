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
