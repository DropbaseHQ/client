from uuid import UUID

# NOTE:  this file mimics tasks
from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from server import crud
from server.controllers.task.source_column_helper import connect_to_user_db
from server.controllers.task.source_column_model import get_parsed_schema, get_regrouped_schema
from server.schemas.sqls import QueryTable


def get_table_data(db: Session, request: QueryTable):
    # TODO: replace app_id with table id
    user_db_engine = connect_to_user_db()

    sql = crud.sqls.get_app_sql(db, app_id=request.app_id)
    # apply filters
    filter_sql, join_filters = apply_filters(sql.code, request.filters, request.sorts)

    with user_db_engine.connect().execution_options(autocommit=True) as conn:
        res = conn.execute(text(sql.code)).all()

    col_names = list(res[0]._mapping.keys())
    regrouped_schema, parsed_column_names = get_regrouped_schema(col_names)
    schema = get_parsed_schema(user_db_engine, regrouped_schema)
    # save table row dataclass to db
    row_dataclass = compose_classes_from_row_data(schema)
    sql.dataclass = row_dataclass
    db.commit()
    with user_db_engine.connect().execution_options(autocommit=True) as conn:
        res = conn.execute(text(filter_sql), join_filters).all()
    data = [list(row) for row in res]

    return {"header": parsed_column_names, "data": data, "schema": schema, "sql_id": sql.id}


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


def apply_filters(sql, filters, sorts):

    filter_dict = {}
    sql = sql[:-1] if sql.endswith(";") else sql
    filter_sql = f"""SELECT * FROM ({sql}) as user_query\n"""
    if len(filters) > 0:
        filter_sql += "WHERE \n"
    for filter in filters:
        sql_column_name = f"{filter['schema_name']}.{filter['table_name']}.{filter['column_name']}"
        dict_column_name = f"{filter['schema_name']}_{filter['table_name']}_{filter['column_name']}"
        filter_dict[f"{dict_column_name}_filter"] = filter["value"]
        filter_sql += (
            f"""user_query."{sql_column_name}" {filter['operator']} :{dict_column_name}_filter AND\n"""
        )

    filter_sql = filter_sql[:-4] + "\n"

    if len(sorts) > 0:
        filter_sql += "ORDER BY \n"

    for sort in sorts:
        sql_column_name = f"{sort['schema_name']}.{sort['table_name']}.{sort['column_name']}"
        filter_sql += f"""user_query."{sql_column_name}" {sort['value']},\n"""

    filter_sql = filter_sql[:-2] + ";"

    return filter_sql, filter_dict
