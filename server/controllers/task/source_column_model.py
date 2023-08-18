from typing import List

from sqlalchemy import engine

from server.controllers.task.base_source_column import SourceColumn
from server.controllers.task.postgres_source_column import get_pg_column_model
from server.controllers.task.source_column_helper import update_column_meta_with_filters

schema_names = ["public"]
default_schema = "public"


def add_to_schema(new_schema, schema, table, column):
    if schema not in new_schema.keys():
        new_schema[schema] = {}
    if table not in new_schema[schema].keys():
        new_schema[schema][table] = {}
    new_schema[schema][table][column] = {"filters": []}
    return new_schema


def get_regrouped_schema(col_names: List[str]):
    """
    convert a list of column names into a nested dictionary with the following structure:
    {
        "schema_name": {
            "table_name": {
                "column_name": {
                    "filters": ["filter1", "filter2", ...]
                }
            }
        }
    }

    used to query the user's database for the column metadata by schema and table
    """
    regrouped_schema = {}
    parsed_column_names = []
    schema_table_col_lenght = 3
    for col in col_names:
        col_name_arr = col.split(".")
        # can start with schema or table name
        # TODO: improve this by comparing table names and column names
        if col_name_arr[0] in schema_names:
            schema = col_name_arr[0]
            table = col_name_arr[1]
            column = col_name_arr[2]
            schema_table_col_lenght = 3
        else:
            schema = default_schema
            table = col_name_arr[0]
            column = col_name_arr[1]
            schema_table_col_lenght = 2

        regrouped_schema = add_to_schema(regrouped_schema, schema, table, column)

        if len(col_name_arr) > schema_table_col_lenght:
            for filter in col_name_arr[schema_table_col_lenght:]:
                regrouped_schema[schema][table][column]["filters"].append(filter)

        # will be used to display table columns
        parsed_column_names.append({"schema": schema, "table": table, "column": column})

    return regrouped_schema, parsed_column_names


def get_parsed_schema(user_db_engine: engine, regrouped_schema: dict):
    new_schema = {}
    for schema in regrouped_schema.keys():
        # add schema to new schema if not present
        new_schema[schema] = {} if schema not in new_schema else new_schema[schema]

        for table in regrouped_schema[schema].keys():
            # add table to schema if not present
            new_schema[schema][table] = (
                {} if table not in new_schema[schema] else new_schema[schema][table]
            )

            new_schema = parse_postgres_column_model(
                user_db_engine, regrouped_schema, schema, table, new_schema
            )

    return new_schema


def parse_postgres_column_model(
    user_db_engine: engine, regrouped_schema: dict, schema: str, table: str, new_schema: dict
):
    # get columns metadata from schema and table
    table_columns = get_pg_column_model(user_db_engine, schema, table)

    # find if columns are editable
    editable_column = None
    for col in table_columns:
        if col.primary_key:
            editable_column = col.name
            break  # if found primary key, we're done searching for editable col
        if col.nullable is False and col.unique is True:
            editable_column = col.name

    for column in table_columns:
        if column.name in regrouped_schema[schema][table].keys():
            # cast column to SourceColumn
            source_column = SourceColumn.from_orm(column)
            # add key
            source_column.key_column = editable_column
            # set editable
            source_column.editable = True if editable_column else False
            # set keylike
            if source_column.nullable is False and source_column.unique is True:
                source_column.keylike = True
            if source_column.primary_key:
                source_column.keylike = True
            # apply filters if any
            filters = regrouped_schema[schema][table][column.name]["filters"]
            if len(filters) > 0:
                source_column = update_column_meta_with_filters(source_column, filters)
            new_schema[schema][table][column.name] = source_column.dict()

    return new_schema
