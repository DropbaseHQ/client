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
        "source_id": table.source_id,
        "type": table.type,
    }


def create_table(db, request: CreateTablesRequest) -> ReadTables:
    table = crud.tables.create(db, obj_in=CreateTables(**request.dict()))
    return table


def update_table(
    db: Session, table_id: UUID, request: UpdateTablesRequest, response: Response
) -> ReadTables:
    try:
        table = crud.tables.update_by_pk(db, pk=table_id, obj_in=request)
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
