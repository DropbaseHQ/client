from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.schemas.columns import CreateColumns, PgColumn, PythonColumn, UpdateColumns

column_type_to_schema_mapper = {"postgres": PgColumn, "python": PythonColumn}


def create_column(db: Session, request: CreateColumns):
    ColumnClass = column_type_to_schema_mapper[request.type]
    # check if properties could be casted properly
    ColumnClass(**request.property)
    return crud.columns.create(db, obj_in=request)


def update_column(db: Session, column_id: UUID, request: UpdateColumns):
    ColumnClass = column_type_to_schema_mapper[request.type]
    column = ColumnClass(**request.property)
    request.property = column.dict()
    return crud.columns.update_by_pk(db, pk=column_id, obj_in=request)
