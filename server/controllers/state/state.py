from uuid import UUID

from pydantic import create_model
from sqlalchemy.orm import Session

from server import crud
from server.controllers.state.models import *


def get_component_props(db: Session, page_id: UUID):
    page = crud.page.get_object_by_id_or_404(db, id=page_id)
    page_widgets = {"widgets": {}, "tables": {}}
    widgets = crud.widget.get_page_widgets(db, page_id=page.id)
    for widget in widgets:
        components = crud.components.get_widget_component(db, widget_id=widget.id)
        components = [comp.__dict__ for comp in components]
        page_widgets["widgets"][widget.name] = {"property": widget.property, "components": components}

    tables = crud.tables.get_page_tables(db, page_id=page.id)
    for table in tables:
        columns = crud.columns.get_table_columns(db, table_id=table.id)
        columns = [col.__dict__ for col in columns]
        page_widgets["tables"][table.name] = {"property": table.property, "columns": columns}

    return page_widgets


def get_state_context_for_client(db: Session, page_id: UUID):
    # TODO: refactor this
    page = crud.page.get_object_by_id_or_404(db, id=page_id)
    state = {"widgets": {}, "tables": {}}
    context = {"widgets": {}, "tables": {}}
    # page_widgets = {"widgets": {}, "tables": {}}
    widgets = crud.widget.get_page_widgets(db, page_id=page.id)
    components_mapper = {"input": InputContextProperty, "button": ButtonContextProperty}
    for widget in widgets:
        widget_init = WidgetContextProperty(**widget.property)
        components = crud.components.get_widget_component(db, widget_id=widget.id)
        components_contexts = {}
        components_state = {}
        for comp in components:
            comp_name = comp.property.get("name")
            # for state, we just need to return an empty value
            components_state[comp_name] = None
            # for context, we first need to find a class (XxxContextProperty)
            component_class = components_mapper.get(comp.type)
            # then initiate it with component properties
            component_def = component_class(**comp.property)
            # then get dict values from that initiated class
            components_contexts[comp_name] = component_def.dict()

        state["widgets"][widget.name] = components_state
        widget_context = widget_init.dict()
        widget_context["components"] = components_contexts
        context["widgets"][widget.name] = widget_context

    # same logic for tables
    tables = crud.tables.get_page_tables(db, page_id=page.id)
    columns_mapper = {"postgres": PgColumnContextProperty}
    for table in tables:
        table_init = TableContextProperty(**table.property)
        columns = crud.columns.get_table_columns(db, table_id=table.id)
        columns_contexts = {}
        columns_state = {}
        for comp in columns:
            comp_name = comp.property.get("name")
            columns_state[comp_name] = None
            column_class = columns_mapper.get(comp.type)
            column_def = column_class(**comp.property)
            columns_contexts[comp_name] = column_def.dict()
        state["tables"][table.name] = columns_state
        table_context = table_init.dict()
        table_context["columns"] = columns_contexts
        context["tables"][table.name] = table_context
    return state, context


def get_state_for_client(db: Session, page_id: UUID):
    # TODO: refactor this
    page = crud.page.get_object_by_id_or_404(db, id=page_id)

    state = {"widgets": {}, "tables": {}}
    widgets = crud.widget.get_page_widgets(db, page_id=page.id)
    for widget in widgets:
        components = crud.components.get_widget_component(db, widget_id=widget.id)
        components_state = {}
        for comp in components:
            comp_name = comp.property.get("name")
            # for state, we just need to return an empty value
            components_state[comp_name] = None
        state["widgets"][widget.name] = components_state

    # same logic for tables
    tables = crud.tables.get_page_tables(db, page_id=page.id)
    for table in tables:
        columns = crud.columns.get_table_columns(db, table_id=table.id)
        columns_state = {}
        for comp in columns:
            comp_name = comp.property.get("name")
            columns_state[comp_name] = None
        state["tables"][table.name] = columns_state

    return state


base_property_mapper = {
    "context": {
        "Widgets": {
            "base": WidgetContextProperty,
            "dir": "components",
            "children": {"input": InputContextProperty, "button": ButtonContextProperty},
        },
        "Tables": {
            "base": TableContextProperty,
            "dir": "columns",
            "children": {"postgres": PgColumnContextProperty},
        },
    },
    "defined": {
        "Widgets": {
            "base": WidgetDefinedProperty,
            "dir": "components",
            "children": {"input": InputDefinedProperty, "button": ButtonDefinedProperty},
        },
        "Tables": {
            "base": TableDefinedProperty,
            "dir": "columns",
            "children": {"postgres": PgColumnDefinedProperty},
        },
    },
}

non_editable_components = {"Widgets": ["button", "text"], "Tables": []}


class GenerateReourceClass:
    # TODO: refactor, maybe simplify back to a function
    def __init__(self, resource_type: str = "defined", resource: str = "Widgets"):
        self.resource = resource
        self.resource_type = resource_type
        self.non_editable_components = non_editable_components.get(resource)
        self.resource_mapper = base_property_mapper.get(resource_type).get(resource)
        self.BaseProperty = self.resource_mapper.get("base")
        self.children_dir = self.resource_mapper.get("dir")

    def get_defined_context_class(self, resources: dict):

        resources_props = {}

        for resource_name, resource_data in resources.items():

            components_props = {}
            for component in resource_data[self.children_dir]:
                components_props[component["property"]["name"]] = (
                    self.resource_mapper.get("children").get(component["type"]),
                    ...,
                )

            components_class_name = (
                resource_name.capitalize()
                + self.children_dir.capitalize()
                + self.resource_type.capitalize()
            )
            locals()[components_class_name] = create_model(components_class_name, **components_props)

            resource_class_name = resource_name.capitalize() + self.resource_type.capitalize()
            locals()[resource_class_name] = create_model(
                resource_class_name,
                **{self.children_dir: (locals()[components_class_name], ...)},
                __base__=self.BaseProperty
            )

            resources_props[resource_name] = (locals()[resource_class_name], ...)

        # compose Widgets
        return create_model(self.resource + self.resource_type.capitalize(), **resources_props)

    def get_state_class(self, resources: dict):

        resources_props = {}

        for resource_name, resource_data in resources.items():
            components_props = {}
            for component in resource_data[self.children_dir]:
                if component["type"] in self.non_editable_components:
                    continue
                # to find a state type, component must be first initiated
                component_type = self.resource_mapper.get("children").get(component["type"])
                # initiate component
                init_component = component_type(**component["property"])
                # state is pulled from ComponentDefined class
                components_props[component["property"]["name"]] = (Optional[init_component.state], None)

            resource_class_name = resource_name.capitalize() + "State"
            locals()[resource_class_name] = create_model(resource_class_name, **components_props)

            resources_props[resource_name] = (locals()[resource_class_name], ...)

        # compose Widgets
        return create_model(self.resource + "State", **resources_props)


def get_state_context(db: Session, page_id: UUID):
    page_table_widgets = get_component_props(db, page_id)
    # compose defined context and state
    class_generator = GenerateReourceClass(resource_type="defined", resource="Widgets")
    WidgetState = class_generator.get_state_class(page_table_widgets.get("widgets"))
    class_generator = GenerateReourceClass(resource_type="defined", resource="Tables")
    TableState = class_generator.get_state_class(page_table_widgets.get("tables"))

    class State(BaseModel):
        widgets: WidgetState
        tables: TableState

    class_generator = GenerateReourceClass(resource_type="context", resource="Widgets")
    WidgetContext = class_generator.get_defined_context_class(page_table_widgets.get("widgets"))
    class_generator = GenerateReourceClass(resource_type="context", resource="Tables")
    TablesContext = class_generator.get_defined_context_class(page_table_widgets.get("tables"))

    class Context(BaseModel):
        widgets: WidgetContext
        tables: TablesContext

    return State, Context


def get_page_state(db: Session, page_id: UUID):

    page_table_widgets = get_component_props(db, page_id)
    class_generator = GenerateReourceClass(resource_type="defined", resource="Widgets")
    WidgetState = class_generator.get_state_class(page_table_widgets.get("widgets"))
    class_generator = GenerateReourceClass(resource_type="defined", resource="Tables")
    TableState = class_generator.get_state_class(page_table_widgets.get("tables"))

    class State(BaseModel):
        widgets: WidgetState
        tables: TableState

    return State
