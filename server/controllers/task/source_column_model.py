from server.controllers.task.postgres_source_column import parse_postgres_column_model
from server.controllers.task.source_column_helper import update_column_meta_with_filters
from server.controllers.task.stripe_source_columns import stripe_columns


def get_regrouped_schema(col_names):
    regrouped_schema = {}
    for col_name in col_names:

        col_name_arr = col_name.split(".")
        schema_name = col_name_arr[0]
        table_name = col_name_arr[1]
        column_name = col_name_arr[2]

        if schema_name not in regrouped_schema:
            regrouped_schema[schema_name] = {}

        if table_name not in regrouped_schema[schema_name]:
            regrouped_schema[schema_name][table_name] = {}

        regrouped_schema[schema_name][table_name][column_name] = {"filters": []}

        if len(col_name_arr) > 3:
            for filter in col_name_arr[3:]:
                regrouped_schema[schema_name][table_name][column_name]["filters"].append(filter)

    return regrouped_schema


# for postgres only
def get_parsed_schema(user_db_engine, regrouped_schema):
    new_schema = {}
    for schema_name in regrouped_schema.keys():
        if schema_name not in new_schema:
            new_schema[schema_name] = {}

        for table_name in regrouped_schema[schema_name].keys():

            if table_name not in new_schema[schema_name]:
                new_schema[schema_name][table_name] = {}

            # get table column models from sqlalchemy
            if schema_name == "public":
                new_schema = parse_postgres_column_model(
                    user_db_engine, regrouped_schema, schema_name, table_name, new_schema
                )
            elif schema_name == "stripe":
                for column in regrouped_schema[schema_name][table_name].keys():
                    source_column = stripe_columns[table_name][column]
                    filters = regrouped_schema[schema_name][table_name][column]["filters"]
                    if len(filters) > 0:
                        source_column = update_column_meta_with_filters(source_column, filters)
                    new_schema[schema_name][table_name][column] = source_column.dict()

    return new_schema


def get_header_schema(user_db_engine, col_names):
    regrouped_schema = get_regrouped_schema(col_names)
    return get_parsed_schema(user_db_engine, regrouped_schema)
