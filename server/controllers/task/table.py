from uuid import UUID

# NOTE:  this file mimics tasks
from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from server import crud
from server.controllers.task.source_column_helper import connect_to_user_db
from server.controllers.task.source_column_model import get_parsed_schema, get_regrouped_schema


def get_table_data(db: Session, app_id: UUID):
    sql = crud.sqls.get_app_sqls(db, app_id=app_id)
    user_db_engine = connect_to_user_db()
    with user_db_engine.connect().execution_options(autocommit=True) as conn:
        res = conn.execute(text(sql[0].code)).all()

    # col_names = list(res[0].keys())
    col_names = list(res[0]._mapping.keys())
    regrouped_schema, parsed_column_names = get_regrouped_schema(col_names)
    schema = get_parsed_schema(user_db_engine, regrouped_schema)
    # save table row dataclass to db
    row_dataclass = compose_classes_from_row_data(schema)
    sql[0].dataclass = row_dataclass
    db.commit()
    data = [list(row) for row in res]

    return {"header": parsed_column_names, "data": data, "schema": schema}


type_mapping = {
    "text": str,
    "integer": int,
    "float": float,
    "boolean": bool,
    "list": list,
    "dictionary": dict,
    "tuple": tuple,
    "set": set,
}


def compose_classes_from_row_data(row_data: dict):
    all_cls = "from dataclasses import dataclass\n"
    row_cls_str = "@dataclass\n"
    row_cls_str += "class Row:\n"

    for schema, tables in row_data.items():
        schema_cls_str = "@dataclass\n"
        schema_name = schema.capitalize()
        schema_cls_str += f"class {schema_name}:\n"

        for table, column in tables.items():
            table_name = schema_name + table.capitalize()
            cls_str = "@dataclass\n"
            cls_str += f"class {table_name}:\n"
            for column, val in column.items():
                cls_str += f"    {val['name']}: {type_mapping.get(val['type']).__name__}\n"
            all_cls += cls_str + "\n"
            schema_cls_str += f"    {table}: {table_name}\n"
        all_cls += schema_cls_str + "\n"
        row_cls_str += f"    {schema}: {schema_name}\n"
    all_cls += row_cls_str
    return all_cls
