from uuid import UUID

from fastapi import Response
from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from server import crud
from server.controllers.tables.helper import get_row_schema
from server.models.tables import Tables
from server.schemas.tables import (
    CreateTables,
    CreateTablesRequest,
    PinFilters,
    ReadTables,
    TablesBaseProperty,
    UpdateTablesRequest,
)
from server.utils.converter import get_class_properties


def get_table_properties():
    return get_class_properties(TablesBaseProperty)


def get_table(db, table_id: UUID):
    table = crud.tables.get_object_by_id_or_404(db, id=table_id)
    table_props = get_class_properties(TablesBaseProperty)
    return {
        "properties": table_props,
        "values": table.property,
        "type": table.type,
    }


def create_table(db, request: CreateTablesRequest) -> ReadTables:
    table = crud.tables.create(db, obj_in=CreateTables(**request.dict()))
    return table


from server.controllers.columns import update_table_columns
from server.controllers.state.state import get_state_context, get_state_for_client
from server.controllers.state.update import get_columns_from_worker, update_state_context_in_worker


def update_table(
    db: Session, table_id: UUID, request: UpdateTablesRequest, response: Response
) -> ReadTables:
    try:
        table = crud.tables.update_by_pk(db, pk=table_id, obj_in=request)
        # get current state
        page_name, app_name = crud.tables.get_page_app_names_from_table(db, table_id)

        state = get_state_for_client(db, table.page_id)
        # get columns from worker
        resp = get_columns_from_worker(table.property, state, app_name, page_name, request.token)
        columns = resp.get("columns")
        if not columns:
            return {"message": "no columns returned"}

        # update columns in db
        update_table_columns(db, table, columns)

        # create new state and context
        State, Context = get_state_context(db, table.page_id)
        # update state and context in worker
        update_state_context_in_worker(State, Context, app_name, page_name, request.token)

        return table
    except Exception as e:
        response.status_code = 400
        return {"error": str(e)}


def get_table_columns(user_db_engine, table_str):
    user_query_cleaned = table_str.strip("\n ;")

    with user_db_engine.connect().execution_options(autocommit=True) as conn:
        res = conn.execute(text(f"SELECT * FROM ({user_query_cleaned}) AS q LIMIT 1")).all()
    return list(res[0].keys())


def get_table_row(db: Session, table_id: UUID):
    columns = crud.columns.get_table_columns(db, table_id=table_id)
    return get_row_schema(columns)


def pin_filters(db: Session, request: PinFilters):
    table = crud.tables.get_object_by_id_or_404(db, id=request.table_id)
    table_props = table.property
    table_props["filters"] = [filter.dict() for filter in request.filters]
    db.query(Tables).filter(Tables.id == request.table_id).update({"property": table_props})
    db.commit()
    db.refresh(table)
    return table
