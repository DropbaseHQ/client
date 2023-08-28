from typing import TypedDict

from sqlalchemy import inspect
from sqlalchemy.orm import Session

from server import crud
from server.controllers.task.source_column_helper import connect_to_user_db


class PageSchema(TypedDict):
    metadata: dict[str, str]
    schema: dict[str, dict[str, dict[str, dict]]]


def get_page_schema() -> PageSchema:
    # connection_str = f"postgresql+psycopg2://dropmail:dropmail@dropmail.cbwxplfobdd5.us-west-1.rds.amazonaws.com:5432/dropmail"
    # engine = create_engine(connection_str)
    engine = connect_to_user_db()
    return get_db_schema(engine)


def get_db_schema(engine) -> PageSchema:
    inspector = inspect(engine)
    schemas = inspector.get_schema_names()
    default_search_path = inspector.default_schema_name

    database_structure: PageSchema = {
        "metadata": {
            "default_schema": default_search_path,
        },
        "schema": {},
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


def get_page_details(db: Session, page_id: str):
    page = crud.page.get_object_by_id_or_404(db, id=page_id)
    action = crud.action.get_page_action(db, page_id=page_id)
    page_sql = crud.sqls.get_page_sqls(db, page_id=page_id)
    page_functions = crud.functions.get_action_functions(db, action_id=action.id)
    page_components = crud.components.get_action_component(db, action_id=action.id)
    organized_functions = {
        "fetchers": [],
        "ui_components": [page_components],
    }
    for function in page_functions:
        if function.type == "ui":
            organized_functions["ui_components"].append(function)
        else:
            organized_functions["fetchers"].append(function)

    return {"page": page, "action": action, "sql": page_sql, "functions": organized_functions}
