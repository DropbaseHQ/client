from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.controllers.state.update import update_state_context_in_worker
from server.models.columns import Columns
from server.schemas.columns import (
    CreateColumns,
    PgDefinedColumnProperty,
    PyDefinedColumnProperty,
    SyncColumns,
    UpdateColumns,
    UpdateColumnsRequest,
)
from server.utils.converter import get_class_properties

column_type_to_schema_mapper = {"sql": PgDefinedColumnProperty, "python": PyDefinedColumnProperty}


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
    columns = crud.columns.get_table_columns(db, table_id=table_id)
    values = []
    for column in columns:
        values.append({"name": column.name, "property": column.property})

    column_class = column_type_to_schema_mapper.get(table.type)
    column_props = get_class_properties(column_class)
    return {"schema": column_props, "values": values}


def update_table_columns_and_props(db: Session, request: UpdateColumnsRequest):

    table = crud.tables.get_object_by_id_or_404(db, id=request.table_id)
    page = crud.page.get_table_page(db, table.id)
    db_columns = crud.columns.get_table_columns(db, table_id=request.table_id)

    cols_to_add, cols_to_delete = [], []

    if not db_columns:
        cols_to_add = request.columns
    else:
        # check for delta
        db_cols_names = [col.property["name"] for col in db_columns]
        for col in db_columns:
            if col.property["name"] not in request.columns:
                cols_to_delete.append(col)

        for col in request.columns:
            if col not in db_cols_names:
                cols_to_add.append(col)

    # delete columns
    for col in cols_to_delete:
        crud.columns.remove(db, id=col.id)

    # add columns
    column_class = column_type_to_schema_mapper.get(table.type)
    for column in cols_to_add:
        create_column_record_from_name(db, column, table.id, column_class)

    db.commit()

    update_state_context_in_worker(db, page.id)

    return table


from typing import List

from server.schemas.tables import ReadTables


def update_table_columns(db: Session, table: ReadTables, columns: List[str]):

    cols_to_add, cols_to_delete = [], []
    db_columns = crud.columns.get_table_columns(db, table_id=table.id)

    if not db_columns:
        cols_to_add = columns
    else:
        # check for delta
        db_cols_names = [col.property["name"] for col in db_columns]
        for col in db_columns:
            if col.property["name"] not in columns:
                cols_to_delete.append(col)

        for col in columns:
            if col not in db_cols_names:
                cols_to_add.append(col)

    # delete columns
    for col in cols_to_delete:
        crud.columns.remove(db, id=col.id)

    # add columns
    column_class = column_type_to_schema_mapper.get(table.type)
    for column in cols_to_add:
        create_column_record_from_name(db, column, table.id, column_class)

    db.commit()


def create_column_record_from_name(db: Session, col_name: str, table_id: UUID, column_class) -> Columns:
    column_obj = CreateColumns(
        name=col_name,
        property=column_class(name=col_name),
        table_id=table_id,
        type="postgres",
    )
    return crud.columns.create(db, obj_in=column_obj)


from server.controllers.state.state import get_state_context


def sync_columns(db: Session, request: SyncColumns):
    table = crud.tables.get_object_by_id_or_404(db, id=request.table_id)
    update_table_columns(db, table, request.columns)

    # create new state and context
    State, Context = get_state_context(db, table.page_id)
    # update state and context in worker
    update_state_context_in_worker(State, Context)

    return table
