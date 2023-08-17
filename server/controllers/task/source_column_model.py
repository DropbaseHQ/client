from typing import List

from sqlalchemy import engine

from server.controllers.task.postgres_source_column import parse_postgres_column_model
from server.controllers.task.stripe_source_columns import parse_stripe_column_model

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
        new_schema[schema] = {} if schema not in new_schema else None

        for table in regrouped_schema[schema].keys():
            # add table to schema if not present
            new_schema[schema][table] = {} if table not in new_schema[schema] else None

            new_schema = parse_postgres_column_model(
                user_db_engine, regrouped_schema, schema, table, new_schema
            )

            # # get table column models from sqlalchemy
            # if schema == "public":
            #     new_schema = parse_postgres_column_model(
            #         user_db_engine, regrouped_schema, schema, table, new_schema
            #     )
            # elif schema == "stripe":
            #     new_schema = parse_stripe_column_model(regrouped_schema, schema, table, new_schema)

    return new_schema
