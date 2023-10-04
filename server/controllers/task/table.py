from typing import List

from fastapi import Response
from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from server import crud
from server.controllers.tables.helper import parse_state, render_sql
from server.schemas.pinned_filters import Filter, Sort
from server.schemas.tables import QueryResponse, QueryTable
from server.utils.connect_to_user_db import connect_to_user_db


def get_table_data(db: Session, request: QueryTable, response: Response) -> QueryResponse:
    table = crud.tables.get_object_by_id_or_404(db, id=request.table_id)
    if table.source_id is None:
        return QueryResponse(table_id=table.id, table_name=table.name, error="No source")
    try:
        if table.property["code"] == "":
            return QueryResponse(table_id=table.id, table_name=table.name)
        columns = crud.columns.get_table_columns(db, table_id=table.id)

        # parse state
        if crud.page.get_object_by_id_or_404(db, request.page_id):
            state = parse_state(db, request.page_id, request.state)

        # render sql with jigja2 and state variables
        user_sql = render_sql(table.property["code"], state)

        # apply filters
        filter_sql, filter_values = apply_filters(user_sql, request.filters, request.sorts)

        user_db_engine = connect_to_user_db(db, table.source_id)
        with user_db_engine.connect().execution_options(autocommit=True) as conn:
            res = conn.execute(text(filter_sql), filter_values).all()
        user_db_engine.dispose()

        if not res:
            return QueryResponse(
                table_id=table.id, table_name=table.name, header=[], data=[], columns={}
            )

        data = [list(row) for row in res]
        col_names = list(res[0].keys())

        # assert all the columns in schema are present in the result
        column_schema = {column.name: {**{"id": column.id}, **column.property} for column in columns}
        assert set(column_schema.keys()).issubset(set(col_names))

        return QueryResponse(
            table_id=table.id, table_name=table.name, header=col_names, data=data, columns=column_schema
        )
    except Exception as e:
        print(e)
        response.status_code = 400
        return QueryResponse(table_id=table.id, table_name=table.name, error=str(e))


def apply_filters(table_sql: str, filters: List[Filter], sorts: List[Sort]):
    # clean sql
    table_sql = table_sql.strip("\n ;")
    filter_sql = f"""WITH user_query as ({table_sql}) SELECT * FROM user_query\n"""

    # apply filters
    filter_values = {}
    if filters:
        filter_sql += "WHERE \n"

        filters_list = []
        for filter in filters:
            filter_value_name = f"{filter.column_name}_filter"
            if filter.condition == "like":
                filter.value = f"%{filter.value}%"

            filter_values[filter_value_name] = filter.value
            filters_list.append(
                f'user_query."{filter.column_name}" {filter.condition} :{filter_value_name}'
            )

        filter_sql += " AND ".join(filters_list)
    filter_sql += "\n"

    # apply sorts
    if sorts:
        filter_sql += "ORDER BY \n"
        sort_list = []
        for sort in sorts:
            sort_list.append(f'user_query."{sort.column_name}" {sort.value}')

        filter_sql += ", ".join(sort_list)
    filter_sql += "\n"

    return filter_sql, filter_values
