from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.controllers.tables.helper import get_row_schema
from server.controllers.widget.helpers import get_user_input
from server.schemas.states import PgColumnStateProperty, TableStateProperty, WidgetStateProperty
from server.utils.components import state_component_type_mapper, state_update_components
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
        state["tables"][table.name]["columns"] = {}
        for col in columns:
            col_state = PgColumnStateProperty(**col.property)
            state["tables"][table.name]["columns"][col.property["name"]] = col_state.dict()

    # get user input schema
    widget = crud.widget.get_page_widget(db, page_id=page_id)
    if widget:
        components = []
        # get components for widget
        components = crud.components.get_widget_component(db, widget.id)
        widget_props = get_class_dict(WidgetStateProperty)
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


def order_tables(tables):
    """
    Tables are sorted using their property.appears_after field.
    We use a DFS to find chains of tables that depend on each other first.
    Then we reverse the order of objects within each chain.
    We then flatten the list of chains to get the final order.
    """

    def dfs(node, chain):
        if node not in visited:
            visited.add(node)
            chain.append(node)

            next_node_data = name_to_dependency.get(node)
            next_node_appears_after = next_node_data.get("appears_after")
            if next_node_appears_after:
                dfs(next_node_appears_after, chain)

    name_to_dependency = {
        item.property.get("name"): {"appears_after": item.property.get("appears_after"), "item": item}
        for item in tables
    }
    visited = set()
    chains = []

    for node in name_to_dependency.keys():
        if node not in visited:
            chain = []
            dfs(node, chain)
            chains.append(chain)

    for i in range(len(chains)):
        chains[i] = chains[i][::-1]

    final_tables = []
    for chain in chains:
        for table_name in chain:
            final_tables.append(name_to_dependency.get(table_name).get("item"))

    return final_tables


def get_page_details(db: Session, page_id: str):
    page = crud.page.get_object_by_id_or_404(db, id=page_id)
    app = crud.app.get_object_by_id_or_404(db, id=page.app_id)
    tables = crud.tables.get_page_tables(db, page_id=page_id)
    functions = crud.functions.get_page_functions(db, page_id=page.id)
    widget = crud.widget.get_page_widget(db, page_id=page_id)
    return {
        "page": page,
        "app": app,
        "widget": widget,
        "tables": order_tables(tables),
        "functions": functions,
    }
