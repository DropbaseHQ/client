from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.schemas.columns import (
    CreateColumns,
    PgDefinedColumnProperty,
    PgReadColumnProperty,
    PythonColumn,
    UpdateColumns,
)
from server.utils.converter import get_class_properties
from server.utils.helper import raise_http_exception

column_type_to_schema_mapper = {"postgres": PgDefinedColumnProperty, "python": PythonColumn}


def create_column(db: Session, request: CreateColumns):
    try:
        ColumnClass = column_type_to_schema_mapper[request.type]
    except KeyError:
        raise_http_exception(400, f"Column type {request.type} is invalid.")
    column = ColumnClass(**request.property)
    request.property = column.dict()
    return crud.columns.create(db, obj_in=request)


def update_column(db: Session, column_id: UUID, request: UpdateColumns):
    ColumnClass = column_type_to_schema_mapper[request.type]
    column = ColumnClass(**request.property)
    request.name = request.property["name"]
    request.property = column.dict()
    return crud.columns.update_by_pk(db, pk=column_id, obj_in=request)


def get_table_columns_and_props(db: Session, table_id: UUID):
    columns = crud.columns.get_table_columns(db, table_id=table_id)
    values = []
    for column in columns:
        values.append({"id": column.id, "property": column.property})

    column_props = get_class_properties(PgReadColumnProperty)
    return {"schema": column_props, "values": values}
