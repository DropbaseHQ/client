from typing import List

from server import crud
from server.controllers.sqls.test_sql import *
from server.schemas.columns import CreateColumns
from server.schemas.sqls import CreateSQLs, UpdateSQLs


def create_sql(db, request: CreateSQLs):
    user_db_engine = connect_to_user_db()
    # get columns
    columns = get_table_columns(user_db_engine, request.code)
    # TODO: infer column types

    dataclass = get_table_dataclass(request.name, columns)
    request.dataclass = dataclass

    # match with existing columns, create columns if needed
    sql = crud.sqls.create(db, obj_in=request)

    # save columns
    for column in columns:
        column_obj = CreateColumns(name=column, property={"name": column}, sql_id=sql.id)
        crud.columns.create(db, obj_in=column_obj)


def get_table_columns(user_db_engine, sql_str):
    user_query_cleaned = sql_str.strip("\n ;")

    with user_db_engine.connect().execution_options(autocommit=True) as conn:
        res = conn.execute(text(f"SELECT * FROM ({user_query_cleaned}) AS q LIMIT 1")).all()
    return list(res[0].keys())


def get_table_dataclass(table_name: str, columns: List) -> str:
    dataclass = f"""class {table_name.capitalize()}Table(BaseModel):"""
    for column in columns:
        dataclass += f"""    {column}: Any"""
    return dataclass


def update_sql(db: Session, sql_id: str, request: UpdateSQLs):
    user_db_engine = connect_to_user_db()
    sql_columns = get_table_columns(user_db_engine, request.code)
    db_columns = crud.columns.get_sql_columns(db, sql_id=sql_id)

    # check for delta
    cols_to_delete = [col for col in db_columns if col.name not in sql_columns]
    cols_to_add = [col for col in sql_columns if col not in db_columns]

    # delete columns
    for col in cols_to_delete:
        crud.columns.remove(db, id=col.id)

    # add columns
    for col in cols_to_add:
        crud.columns.create(db, obj_in=CreateColumns(name=col, property={"name": col}, sql_id=sql_id))

    # update sql
    sql = crud.sqls.get(db, id=sql_id)
    dataclass = get_table_dataclass(sql.name, sql_columns)
    sql.dataclass = dataclass
    db.commit()

    return sql
