from typing import TypedDict
from uuid import UUID

from sqlalchemy import inspect
from sqlalchemy.orm import Session

from server import crud
from server.controllers.tables.helper import get_row_schema
from server.controllers.task.source_column_helper import connect_to_user_db
from server.controllers.widget.helpers import get_user_input
from server.models.user import User
from server.schemas import ReadSQLs
from server.schemas.columns import PgColumnStateProperty
from server.schemas.components import ComponentStateProperty
from server.schemas.tables import TableColumnStateProperty
from server.schemas.widget import WidgetStateProperty
from server.utils.converter import get_class_dict


def get_page_schema(db: Session, page_id: UUID):
    # TODO: get col states for table type
    print("IM HERE!")

    # get select table schema
    tables = crud.tables.get_page_tables(db, page_id=page_id)
    state = {}
    table_schema = {}
    state["tables"] = {}
    for table in tables:
        table_props = get_class_dict(TableColumnStateProperty)
        state["tables"][table.name] = {**table_props}
        # get columns
        columns = crud.columns.get_table_columns(db, table.id)
        row_schema = get_row_schema(columns)
        table_schema[table.name] = row_schema
        column_props = get_class_dict(PgColumnStateProperty)
        state["tables"][table.name]["columns"] = {col.property["name"]: column_props for col in columns}

    # get user input schema
    widget = crud.widget.get_page_widget(db, page_id=page_id)
    # get components for widget
    components = crud.components.get_widget_component(db, widget.id)
    user_input = get_user_input(components)
    state["widget"] = {}
    # TODO: get only ui states
    widget_props = get_class_dict(WidgetStateProperty)
    state["widget"][widget.name] = widget_props
    component_props = get_class_dict(ComponentStateProperty)
    state["widget"][widget.name]["components"] = {
        comp.property["name"]: component_props for comp in components
    }

    return {"tables": table_schema, "user_input": user_input, "state": state}


class DBSchema(TypedDict):
    metadata: dict[str, str]
    schema: dict[str, dict[str, dict[str, dict]]]


def get_db_schema() -> DBSchema:
    engine = connect_to_user_db()
    inspector = inspect(engine)
    schemas = inspector.get_schema_names()
    default_search_path = inspector.default_schema_name

    database_structure: DBSchema = {
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
    sqls = crud.sqls.get_page_sqls(db, page_id=page_id)
    tables = []
    for sql in sqls:
        columns = crud.columns.get_sql_columns(db, sql_id=sql.id)
        tables.append({"sql": sql, "columns": columns})
    functions = crud.functions.get_page_functions(db, page_id=page.id)

    widget = crud.widget.get_page_widget(db, page_id=page_id)
    components = crud.components.get_widget_component(db, widget_id=widget.id)

    return {
        "page": page,
        "widget": widget,
        "tables": tables,
        "columns": columns,
        "functions": functions,
        "components": components,
    }


from typing import Optional

from pydantic import BaseModel


class TableState(BaseModel):
    toast: str
    toast_type: str
    message: str
    message_type: str
    refresh: Optional[bool]


def get_state_table(db, sql: ReadSQLs, columns):
    table_state = TableState(**sql.property)
    return table_state.dict()


def get_app_pages(db: Session, user: User):
    first_workspace = crud.user.get_user_first_workspace(db, user.id)
    first_app = crud.app.get_workspace_apps(db, workspace_id=first_workspace.id)[0]
    return crud.page.get_app_pages(db, first_app.id)
