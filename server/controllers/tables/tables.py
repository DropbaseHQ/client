from uuid import UUID

from fastapi import Response
from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from server import crud
from server.controllers.tables.helper import get_row_schema
from server.models.columns import Columns
from server.models.tables import Tables
from server.schemas.columns import CreateColumns, PgDefinedColumnProperty
from server.schemas.tables import CreateTables, PinFilters, ReadTables, TablesBaseProperty, UpdateTables
from server.utils.connect_to_user_db import connect_to_user_db
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


def create_table(db, request: CreateTables) -> ReadTables:
    # get columns
    user_db_engine = connect_to_user_db(db, request.source_id)
    columns = get_table_columns(user_db_engine, request.property.code)
    user_db_engine.dispose()

    # create table
    request.name = request.property.name
    table = crud.tables.create(db, obj_in=request)

    # save columns
    for column in columns:
        create_column_record_from_name(db, column, table.id)

    return table


def update_table(db: Session, table_id: UUID, request: UpdateTables, response: Response) -> ReadTables:
    try:
        table = crud.tables.get_object_by_id_or_404(db, id=table_id)
        user_db_engine = connect_to_user_db(db, request.source_id)
        table_columns = get_table_columns(user_db_engine, request.property.code)
        user_db_engine.dispose()
        db_columns = crud.columns.get_table_columns(db, table_id=table_id)

        cols_to_add, cols_to_delete = [], []

        if not db_columns:
            cols_to_add = table_columns
        else:
            # check for delta
            db_cols_names = [col.property["name"] for col in db_columns]
            for col in db_columns:
                if col.property["name"] not in table_columns:
                    cols_to_delete.append(col)

            for col in table_columns:
                if col not in db_cols_names:
                    cols_to_add.append(col)

        # delete columns
        for col in cols_to_delete:
            crud.columns.remove(db, id=col.id)

        # add columns
        for column in cols_to_add:
            create_column_record_from_name(db, column, table_id)

        # update table
        request.name = request.property.name
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


def create_column_record_from_name(db: Session, col_name: str, table_id: UUID) -> Columns:
    column_obj = CreateColumns(
        name=col_name,
        property=PgDefinedColumnProperty(name=col_name),
        table_id=table_id,
        type="postgres",
    )
    return crud.columns.create(db, obj_in=column_obj)


def pin_filters(db: Session, request: PinFilters):
    table = crud.tables.get_object_by_id_or_404(db, id=request.table_id)
    table_props = table.property
    table_props["filters"] = [filter.dict() for filter in request.filters]
    db.query(Tables).filter(Tables.id == request.table_id).update({"property": table_props})
    db.commit()
    db.refresh(table)
    return table
