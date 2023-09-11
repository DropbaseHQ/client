from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from server import crud
from server.controllers.tables.convert import call_gpt
from server.controllers.tables.helper import get_column_names, get_db_schema, get_row_schema
from server.controllers.task.source_column_helper import connect_to_user_db
from server.models.columns import Columns
from server.schemas.columns import CreateColumns, PgColumnBaseProperty
from server.schemas.tables import (
    ConvertToSmart,
    CreateTables,
    ReadTables,
    TablesBaseProperty,
    UpdateTables,
)
from server.utils.converter import get_class_properties


def get_table_properties():
    return get_class_properties(TablesBaseProperty)


def get_table(db, table_id: UUID):
    table = crud.tables.get_object_by_id_or_404(db, id=table_id)
    table_props = get_class_properties(TablesBaseProperty)
    return {"properties": table_props, "values": table.property}


def create_table(db, request: CreateTables) -> ReadTables:
    user_db_engine = connect_to_user_db()

    # get columns
    columns = get_table_columns(user_db_engine, request.property.code)

    # create table
    request.name = request.property.name
    table = crud.tables.create(db, obj_in=request)

    # save columns
    for column in columns:
        create_column_record_from_name(db, column, table.id)

    return table


def update_table(db: Session, table_id: UUID, request: UpdateTables) -> ReadTables:
    user_db_engine = connect_to_user_db()
    table_columns = get_table_columns(user_db_engine, request.property.code)
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


def get_table_columns(user_db_engine, table_str):
    user_query_cleaned = table_str.strip("\n ;")

    with user_db_engine.connect().execution_options(autocommit=True) as conn:
        res = conn.execute(text(f"SELECT * FROM ({user_query_cleaned}) AS q LIMIT 1")).all()
    return list(res[0].keys())


def get_table_row(db: Session, table_id: UUID):
    columns = crud.columns.get_table_columns(db, table_id=table_id)
    return get_row_schema(columns)


def fill_smart_cols_data(smart_cols_data: dict):
    pass


def has_primary_key(col_name: str, smart_col_data: dict) -> bool:
    pass


def validate_smart_col_fast(col_data: dict):
    # Will throw an exception
    # column must have primary key
    pass


def validate_smart_col_slow(col_data: dict):
    # Will throw an exception
    pass


def validate_smart_cols(smart_cols_data: dict):
    # Will throw an exception if smart columns are found to be inconsistent with the db
    for col_name, col_data in smart_cols_data.items():
        if has_primary_key(col_name, smart_cols_data):
            validate_smart_col_fast(col_data)
        else:
            validate_smart_col_slow(col_data)


def convert_to_smart_table(db: Session, request: ConvertToSmart):
    user_db_engine = connect_to_user_db()
    table = crud.tables.get_object_by_id_or_404(db, id=request.table_id)
    import pdb;pdb.set_trace()
    db_schema = get_db_schema(user_db_engine)
    user_sql = table.property["code"]
    column_names = get_column_names(user_db_engine, user_sql)
    smart_cols_data = call_gpt(user_sql, column_names, db_schema)

    # Fill smart col data before validation to get
    # primary keys along with other column metadata
    fill_smart_cols_data(smart_cols_data)

    try:
        validate_smart_cols(smart_cols_data)
    except Exception:
        return {"message": "failure"}

    smart_cols = {}
    for col, col_data in smart_cols_data:
        smart_cols[col] = PgColumnBaseProperty(**col_data)

    columns = crud.columns.get_table_columns(db, table_id=table.id)
    for col in columns:
        col.property = smart_cols[col.name].dict()
    db.commit()
    user_db_engine.dispose()
    return {"message": "success"}


def create_column_record_from_name(db: Session, col_name: str, table_id: UUID) -> Columns:
    column_obj = CreateColumns(
        name=col_name,
        property=PgColumnBaseProperty(name=col_name),
        table_id=table_id,
        type="postgres",
    )
    return crud.columns.create(db, obj_in=column_obj)
