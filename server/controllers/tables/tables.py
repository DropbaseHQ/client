from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from server import crud
from server.controllers.columns import update_table_columns
from server.controllers.tables.helper import get_row_schema
from server.models.tables import Tables
from server.schemas.tables import (
    CreateTables,
    PinFilters,
    TablesBaseProperty,
    UpdateTables,
    UpdateTablesRequest,
    ReorderTablesRequest,
)
from server.utils.converter import get_class_properties
from server.utils.state_context import get_state_context_payload


def get_table(db, table_id: UUID):
    table = crud.tables.get_object_by_id_or_404(db, id=table_id)
    file = crud.files.get_file_by_table_id(db, table_id=table_id)
    table_props = get_class_properties(TablesBaseProperty)
    return {"properties": table_props, "table": table, "file": file}


def get_table_columns(user_db_engine, table_str):
    user_query_cleaned = table_str.strip("\n ;")

    with user_db_engine.connect().execution_options(autocommit=True) as conn:
        res = conn.execute(
            text(f"SELECT * FROM ({user_query_cleaned}) AS q LIMIT 1")
        ).all()
    return list(res[0].keys())


def get_table_row(db: Session, table_id: UUID):
    columns = crud.columns.get_table_columns(db, table_id=table_id)
    return get_row_schema(columns)


def pin_filters(db: Session, request: PinFilters):
    table = crud.tables.get_object_by_id_or_404(db, id=request.table_id)
    table_props = table.property
    table_props["filters"] = [filter.dict() for filter in request.filters]
    db.query(Tables).filter(Tables.id == request.table_id).update(
        {"property": table_props}
    )
    db.commit()
    db.refresh(table)
    return table


def create_table(db: Session, request: CreateTables):
    last_table = crud.tables.get_last_table_by_page(db, page_id=request.page_id)
    if last_table and last_table.order is not None:
        request.order = int(last_table.order) + 100
    else:
        request.order = 100
    table = crud.tables.create(db, obj_in=CreateTables(**request.dict()))
    db.commit()
    state_context = get_state_context_payload(db, request.page_id)
    return {
        "state_context": state_context,
        "table": table,
    }


def update_table(db: Session, request: UpdateTablesRequest):
    # update table
    table_updates = UpdateTables(**request.table_updates.dict())
    table = crud.tables.update_by_pk(db, pk=request.table_id, obj_in=table_updates)
    # update columns
    if request.table_columns is not None and len(request.table_columns) > 0:
        file = crud.files.get_object_by_id_or_404(db, id=request.table_updates.file_id)
        update_table_columns(db, table.id, request.table_columns, file.type)

    db.commit()
    state_context = get_state_context_payload(db, request.page_id)
    return {
        "state_context": state_context,
        "table": table,
    }


def delete_table(db: Session, table_id: UUID):
    table = crud.tables.get_object_by_id_or_404(db, id=table_id)
    page_id = table.page_id
    crud.tables.remove(db, id=table_id)
    db.commit()
    return get_state_context_payload(db, page_id)


def reorder_tables(db: Session, request: ReorderTablesRequest):
    for table in request.tables:
        order = table.get("order") * 100
        crud.tables.update_by_pk(db, pk=table.get("id"), obj_in={"order": order})
    db.commit()
    return get_state_context_payload(db, request.page_id)
