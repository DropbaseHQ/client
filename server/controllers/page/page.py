from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.controllers.tables.helper import get_row_schema
from server.controllers.widget.helpers import get_user_input
from server.schemas.states import (
    InputStateProperties,
    PgColumnStateProperty,
    TableStateProperty,
    WidgetStateProperty,
)
from server.utils.converter import get_class_dict


def get_page_schema(db: Session, page_id: UUID):
    # get select table schema
    tables = crud.tables.get_page_tables(db, page_id=page_id)
    state = {"tables": {}, "widget": {}}
    table_schema, user_input = {}, {}
    for table in tables:
        table_state_props = get_class_dict(TableStateProperty)
        state["tables"][table.name] = table_state_props
        # get columns
        columns = crud.columns.get_table_columns(db, table.id)
        row_schema = get_row_schema(columns)

        # get table selection schema
        table_schema[table.name] = row_schema
        column_props = get_class_dict(PgColumnStateProperty)
        state["tables"][table.name]["columns"] = {col.property["name"]: column_props for col in columns}

    # get user input schema
    widget = crud.widget.get_page_widget(db, page_id=page_id)
    if widget:
        components = []
        # get components for widget
        components = crud.components.get_widget_component(db, widget.id)
        widget_props = get_class_dict(WidgetStateProperty)
        state["widget"][widget.name] = widget_props
        component_props = get_class_dict(InputStateProperties)
        state["widget"][widget.name]["components"] = {
            comp.property["name"]: component_props for comp in components
        }

        # get user input schem
        user_input = get_user_input(components)

    return {"tables": table_schema, "user_input": user_input, "state": state}


def get_page_details(db: Session, page_id: str):
    page = crud.page.get_object_by_id_or_404(db, id=page_id)
    tables = crud.tables.get_page_tables(db, page_id=page_id)
    functions = crud.functions.get_page_functions(db, page_id=page.id)
    widget = crud.widget.get_page_widget(db, page_id=page_id)
    return {
        "page": page,
        "widget": widget,
        "tables": tables,
        "functions": functions,
    }
