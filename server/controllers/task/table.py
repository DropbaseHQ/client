from uuid import UUID

# NOTE:  this file mimics tasks
from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from server import crud
from server.controllers.task.source_column_helper import connect_to_user_db
from server.controllers.task.source_column_model import get_parsed_schema, get_regrouped_schema


def get_table_data(db: Session, app_id: UUID):
    sql = crud.sqls.get_app_sqls(db, app_id=app_id)
    print(sql)
    user_db_engine = connect_to_user_db()
    with user_db_engine.connect().execution_options(autocommit=True) as conn:
        res = conn.execute(text(sql[0].code)).all()

    col_names = list(res[0].keys())
    regrouped_schema, parsed_column_names = get_regrouped_schema(col_names)
    schema = get_parsed_schema(user_db_engine, regrouped_schema)
    data = [list(row) for row in res]

    return {"header": parsed_column_names, "data": data, "schema": schema}
