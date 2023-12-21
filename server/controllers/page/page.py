from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.controllers.columns import column_type_to_schema_mapper
from server.controllers.state.models import TableContextProperty, WidgetContextProperty
from server.controllers.tables.helper import get_row_schema
from server.controllers.widget.helpers import get_user_input
from server.utils.components import state_component_type_mapper, state_update_components
from server.utils.converter import get_class_dict


def get_page_schema(db: Session, page_id: UUID):
    # get select table schema
    tables = crud.tables.get_page_tables(db, page_id=page_id)
    state = {"tables": {}, "widget": {}}
    table_schema, user_input = {}, {}

    for table in tables:
        file = crud.files.get_file_by_table_id(db, table_id=table.id)
        table_state_props = get_class_dict(TableContextProperty)
        state["tables"][table.name] = table_state_props
        # get columns
        columns = crud.columns.get_table_columns(db, table.id)
        row_schema = get_row_schema(columns)

        # get table selection schema
        table_schema[table.name] = row_schema
        state["tables"][table.name]["columns"] = {}
        for col in columns:
            column_class = column_type_to_schema_mapper.get(file.type)
            col_state = column_class(**col.property)
            state["tables"][table.name]["columns"][
                col.property["name"]
            ] = col_state.dict()

    # get user input schema
    widget = crud.widget.get_page_widget(db, page_id=page_id)
    if widget:
        components = []
        # get components for widget
        components = crud.components.get_widget_component(db, widget.id)
        widget_props = get_class_dict(WidgetContextProperty)
        state["widget"][widget.name] = widget_props
        state["widget"][widget.name]["components"] = {}
        for component in components:
            if component.type not in state_update_components:
                continue
            ComponentClass = state_component_type_mapper[component.type]
            comp_state = ComponentClass(**component.property)
            comp_name = component.property["name"]
            state["widget"][widget.name]["components"][comp_name] = comp_state.dict()
        # get user input schem
        user_input = get_user_input(components)

    return {"tables": table_schema, "user_input": user_input, "state": state}


def get_page_details(db: Session, page_id: str):
    page = crud.page.get_object_by_id_or_404(db, id=page_id)
    app = crud.app.get_object_by_id_or_404(db, id=page.app_id)
    tables = crud.tables.get_page_tables(db, page_id=page_id)
    widget = crud.widget.get_page_widget(db, page_id=page_id)
    widgets = crud.widget.get_page_widgets(db, page_id=page_id)
    files = crud.files.get_page_files(db, page_id=page.id)
    return {
        "page": page,
        "app": app,
        "widget": widget,
        "widgets": widgets,
        "tables": tables,
        "files": files,
    }
