from typing import List

from sqlalchemy import engine

from server.controllers.task.postgres_source_column import parse_postgres_column_model
from server.controllers.task.stripe_source_columns import parse_stripe_column_model


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
    for col_name in col_names:
        # extract column metadata
        col_name_arr = col_name.split(".")
        schema = col_name_arr[0]
        table = col_name_arr[1]
        column = col_name_arr[2]

        # will be used to display table columns
        parsed_column_names.append(
            {"schema": schema, "table": table, "column": column})

        if schema not in regrouped_schema:
            regrouped_schema[schema] = {}

        if table not in regrouped_schema[schema]:
            regrouped_schema[schema][table] = {}

        regrouped_schema[schema][table][column] = {"filters": []}

        # add filters if present
        if len(col_name_arr) > 3:
            for filter in col_name_arr[3:]:
                regrouped_schema[schema][table][column]["filters"].append(
                    filter)

    return regrouped_schema, parsed_column_names


def get_parsed_schema(user_db_engine: engine, regrouped_schema: dict):
    new_schema = {}
    for schema in regrouped_schema.keys():
        # add schema to new schema if not present
        new_schema[schema] = {} if schema not in new_schema else None

        for table in regrouped_schema[schema].keys():
            # add table to schema if not present
            new_schema[schema][table] = {
            } if table not in new_schema[schema] else None

            # get table column models from sqlalchemy
            if schema == "public":
                new_schema = parse_postgres_column_model(
                    user_db_engine, regrouped_schema, schema, table, new_schema
                )
            elif schema == "stripe":
                new_schema = parse_stripe_column_model(
                    regrouped_schema, schema, table, new_schema)

    return new_schema
