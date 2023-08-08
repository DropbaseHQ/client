import json
from typing import List
from uuid import UUID

# NOTE:  this file mimics tasks
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from server import crud


def connect_to_user_db():
    print("connecting to user db")
    POSTGRES_DB_HOST = "localhost"
    POSTGRES_DB_NAME = "postgres"
    POSTGRES_DB_USER = "postgres"
    POSTGRES_DB_PASS = "postgres"
    POSTGRES_DB_PORT = 5432

    SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg2://{POSTGRES_DB_USER}:{POSTGRES_DB_PASS}@{POSTGRES_DB_HOST}:{POSTGRES_DB_PORT}/{POSTGRES_DB_NAME}"
    return create_engine(SQLALCHEMY_DATABASE_URL)


def get_table_data(db: Session, app_id: UUID):
    sql = crud.sqls.get_app_sqls(db, app_id=app_id)
    engine = connect_to_user_db()
    with engine.connect().execution_options(autocommit=True) as conn:
        res = conn.execute(text(sql[0].code)).all()

    header = list(res[0].keys())
    data = [list(row) for row in res]
    # goup columns by schema and table names

    return {"header": header, "data": data}
