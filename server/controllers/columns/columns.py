from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.controllers.state.models import PgColumnDefinedProperty, PyColumnDefinedProperty
from server.models.columns import Columns
from server.schemas.columns import CreateColumns, SyncColumns, UpdateColumns
from server.schemas.tables import ReadTables
from server.utils.converter import get_class_properties
from server.utils.state_context import get_state_context_payload

column_type_to_schema_mapper = {
    "sql": PgColumnDefinedProperty,
    "python": PyColumnDefinedProperty,
    "data_fetcher": PyColumnDefinedProperty,
    "postgres": PgColumnDefinedProperty,
}


def create_column(db: Session, request: CreateColumns):
    ColumnClass = column_type_to_schema_mapper[request.type]
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
    table = crud.tables.get_object_by_id_or_404(db, id=table_id)

    file = crud.files.get_file_by_table_id(db, table_id=table.id)
    if file:
        columns = crud.columns.get_table_columns(db, table_id=table_id)
        column_class = column_type_to_schema_mapper.get(file.type)
        column_props = get_class_properties(column_class)
    else:
        column_props = []
        columns = []
    return {"schema": column_props, "columns": columns}


def update_table_columns(db: Session, table_id: UUID, columns: List[str], table_type: str):
    crud.columns.delete_table_columns(db, table_id=table_id)
    column_class = column_type_to_schema_mapper.get(table_type)
    for column in columns:
        create_column_record_from_name(db, column, table_id, column_class, table_type)


def create_column_record_from_name(
    db: Session, col_name: str, table_id: UUID, column_class, table_type
) -> Columns:
    column_obj = CreateColumns(
        name=col_name,
        property=column_class(name=col_name),
        table_id=table_id,
        type="postgres" if table_type == "sql" else "python",
    )
    return crud.columns.create(db, obj_in=column_obj)


def sync_columns(db: Session, request: SyncColumns):
    table = crud.tables.get_object_by_id_or_404(db, id=request.table_id)
    page = crud.page.get_object_by_id_or_404(db, widget_id=table.page_id)
    update_table_columns(db, table.id, request.columns, request.type)
    return get_state_context_payload(db, page.id)
