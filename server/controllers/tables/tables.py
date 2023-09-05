from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from server import crud
from server.controllers.task.source_column_helper import connect_to_user_db
from server.models.columns import Columns
from server.schemas.columns import CreateColumns, PgColumn
from server.schemas.tables import CreateTables, ReadTables, UpdateTables


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

    if not db_columns:
        cols_to_delete = []
        cols_to_add = table_columns
    else:
        # check for delta
        cols_to_delete = [col for col in db_columns if col.name not in table_columns]
        cols_to_add = [col for col in table_columns if col not in db_columns]

    # delete columns
    for col in cols_to_delete:
        crud.columns.remove(db, id=col.id)

    # add columns
    for column in cols_to_add:
        create_column_record_from_name(db, column, table_id)

    # update table
    request.name = request.property.name
    table = crud.tables.update_by_pk(db, id=table_id, obj_in=request)

    return table


def get_table_columns(user_db_engine, table_str):
    user_query_cleaned = table_str.strip("\n ;")

    with user_db_engine.connect().execution_options(autocommit=True) as conn:
        res = conn.execute(text(f"SELECT * FROM ({user_query_cleaned}) AS q LIMIT 1")).all()
    return list(res[0].keys())


def create_column_record_from_name(db: Session, col_name: str, table_id: UUID) -> Columns:
    column_obj = CreateColumns(
        name=col_name, property=PgColumn(name=col_name), table_id=table_id, type="postgres"
    )
    return crud.columns.create(db, obj_in=column_obj)


# def get_table_dataclass(table_name: str, columns: List) -> str:
#     dataclass = f"""class {table_name.capitalize()}Table(BaseModel):\n"""
#     for column in columns:
#         dataclass += f"""    {column}: Any\n"""
#     return dataclass
