from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from server import crud
from server.schemas.tables import QueryTable
from server.utils.connect_to_user_db import connect_to_user_db


def get_table_data(db: Session, request: QueryTable):

    table = crud.tables.get_object_by_id_or_404(db, id=request.table_id)
    if table.property["code"] == "":
        return {
            "header": [],
            "data": [],
            "table_id": table.id,
            "table_name": table.name,
            "columns": [],
        }
    columns = crud.columns.get_table_columns(db, table_id=table.id)
    column_schema = {}
    for column in columns:
        column_schema[column.property["name"]] = column.property

    # apply filters
    filter_sql, join_filters = apply_filters(table.property["code"], request.filters, request.sorts)

    user_db_engine = connect_to_user_db()
    with user_db_engine.connect().execution_options(autocommit=True) as conn:
        res = conn.execute(text(filter_sql), join_filters).all()
    user_db_engine.dispose()

    data = [list(row) for row in res]
    col_names = list(res[0].keys())

    return {
        "header": col_names,
        "data": data,
        "table_id": table.id,
        "table_name": table.name,
        "columns": column_schema,
    }


def apply_filters(sql, filters, sorts):
    filter_dict = {}
    sql = sql.strip("\n ;")
    filter_sql = f"""SELECT * FROM ({sql}) as user_query\n"""
    if len(filters) > 0:
        filter_sql += "WHERE \n"

        for filter in filters:
            sql_column_name = f"{filter['schema_name']}.{filter['table_name']}.{filter['column_name']}"
            dict_column_name = f"{filter['schema_name']}_{filter['table_name']}_{filter['column_name']}"
            filter_dict[f"{dict_column_name}_filter"] = filter["value"]
            filter_sql += f"""user_query."{sql_column_name}" {filter['operator']} :{dict_column_name}_filter AND\n"""

        filter_sql = filter_sql[:-4] + "\n"

    if len(sorts) > 0:
        filter_sql += "ORDER BY \n"

    for sort in sorts:
        sql_column_name = f"{sort['schema_name']}.{sort['table_name']}.{sort['column_name']}"
        filter_sql += f"""user_query."{sql_column_name}" {sort['value']},\n"""

    filter_sql = filter_sql[:-2] + ";"

    return filter_sql, filter_dict
