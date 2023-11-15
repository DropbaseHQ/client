from typing import Optional
from uuid import UUID

from pydantic import BaseModel, create_model
from sqlalchemy.orm import Session

from server import crud
from server.controllers.state.models import *

base_property_mapper = {
    "context": {
        "Widgets": {
            "base": WidgetContextProperty,
            "dir": "components",
            "children": {
                "input": InputContextProperty,
                "button": ButtonContextProperty,
                "select": SelectContextProperty,
                "text": TextContextProperty,
            },
        },
        "Tables": {
            "base": TableContextProperty,
            "dir": "columns",
            "children": {
                "postgres": PgColumnContextProperty,
                "python": PyColumnContextProperty,
                "sql": PgColumnContextProperty,
            },
        },
    },
    "defined": {
        "Widgets": {
            "base": WidgetDefinedProperty,
            "dir": "components",
            "children": {
                "input": InputDefinedProperty,
                "button": ButtonDefinedProperty,
                "select": SelectDefinedProperty,
                "text": TextDefinedProperty,
            },
        },
        "Tables": {
            "base": TableDefinedProperty,
            "dir": "columns",
            "children": {"postgres": PgColumnDefinedProperty, "python": PyColumnDefinedProperty},
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
                components_props[component["property"]["name"]] = (Optional[init_component.state], "str")

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


class ComponentHandler:
    def __init__(self, component_type, component_class_mapper):
        self.component_type = component_type
        self.component_class_mapper = component_class_mapper

    def handle(self, db, parent_id):
        components = getattr(crud, self.component_type).get_resources(db, parent_id)
        state, context = {}, {}
        for component in components:
            component_name = component.property.get("name")
            state[component_name] = None
            context[component_name] = self.to_context_prop(component)
        return state, context

    def to_context_prop(self, comp_prop):
        comp_class = self.component_class_mapper.get(comp_prop.type)
        return comp_class(**comp_prop.property).dict()


class ResourceHandler:
    def __init__(self, resource_name, resource_class, comp_handler, parent_class):
        self.resource_name = resource_name
        self.resource_class = resource_class
        self.comp_handler = comp_handler
        self.parent_class = parent_class

    def handle(self, db, page_id):
        resources = getattr(crud, self.resource_name).get_page_resources(db, page_id)
        state, context = {}, {}
        for resource in resources:
            resource_init = self.parent_class(**resource.property)
            context[resource.name] = resource_init.dict()

            resource_state, resource_contexts = self.comp_handler.handle(db, getattr(resource, "id"))
            state[resource.name] = resource_state
            context[resource.name]["components"] = resource_contexts
        return state, context


def get_state_context_for_client(db: Session, page_id: UUID):
    page = crud.page.get_object_by_id_or_404(db, id=page_id)

    widget_mapper = {
        "input": InputContextProperty,
        "button": ButtonContextProperty,
        "text": TextContextProperty,
        "select": SelectContextProperty,
    }
    widget_handler = ComponentHandler("components", widget_mapper)
    widget_res_handler = ResourceHandler("widget", widget_mapper, widget_handler, WidgetContextProperty)

    table_mapper = {"postgres": PgColumnContextProperty, "python": PyColumnContextProperty}
    table_handler = ComponentHandler("columns", table_mapper)
    table_res_handler = ResourceHandler("tables", table_mapper, table_handler, TableContextProperty)

    widget_state, widget_context = widget_res_handler.handle(db, page.id)
    table_state, table_context = table_res_handler.handle(db, page.id)
    state = {"widgets": widget_state, "tables": table_state}
    context = {"widgets": widget_context, "tables": table_context}

    return state, context
