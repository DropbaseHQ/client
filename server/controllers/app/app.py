from typing import TypedDict

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session

from server import crud
from server.controllers.task.source_column_helper import connect_to_user_db


class AppSchema(TypedDict):
    metadata: dict[str, str]
    schema: dict[str, dict[str, dict[str, dict]]]


def get_app_schema() -> AppSchema:
    # connection_str = f"postgresql+psycopg2://dropmail:dropmail@dropmail.cbwxplfobdd5.us-west-1.rds.amazonaws.com:5432/dropmail"
    # engine = create_engine(connection_str)
    engine = connect_to_user_db()
    return get_db_schema(engine)


def get_db_schema(engine) -> AppSchema:
    inspector = inspect(engine)
    schemas = inspector.get_schema_names()
    default_search_path = inspector.default_schema_name

    database_structure: AppSchema = {
        "metadata": {
            "default_schema": default_search_path,
        },
        "schema": {}
    }

    for schema in schemas:
        if schema == "information_schema":
            continue
        tables = inspector.get_table_names(schema=schema)
        schema_tables: dict[str, list[str]] = {}

        for table_name in tables:
            columns = inspector.get_columns(table_name, schema=schema)
            column_names = [column["name"] for column in columns]
            schema_tables[table_name] = column_names
        database_structure["schema"][schema] = schema_tables

    return database_structure


def get_app_details(db: Session, app_id: str):
    app = crud.app.get_object_by_id_or_404(db, id=app_id)
    app_sql = crud.sqls.get_app_sqls(db, app_id=app_id)
    app_functions = crud.functions.get_app_functions(db, app_id=app_id)
    app_components = crud.components.get_app_component(db, app_id=app_id)
    organized_functions = {
        "fetchers": [],
        "ui_components": [app_components],
    }
    for function in app_functions:
        if function.type == "ui":
            organized_functions["ui_components"].append(function)
        else:
            organized_functions["fetchers"].append(function)

    return {"app": app, "sql": app_sql, "functions": organized_functions}
