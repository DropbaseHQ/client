from typing import Optional
from uuid import UUID

from pydantic import BaseModel, create_model
from sqlalchemy.orm import Session

from server import crud
from server.controllers.state.models import *

WIDGETS = "Widgets"
TABLES = "Tables"
NON_EDITABLE_COMPONENTS = {WIDGETS: ["button", "text"], TABLES: []}

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


class GenerateResourceClass(BaseModel):
    resource_type: str
    resource: str
    resource_mapper: dict
    non_editable_components: Optional[list]

    @classmethod
    def from_resource_type_and_resource(cls, resource_type, resource):
        return cls(
            resource_type=resource_type,
            resource=resource,
            non_editable_components=NON_EDITABLE_COMPONENTS[resource],
            resource_mapper=base_property_mapper[resource_type][resource],
        )

    def get_class_models(self, resources):
        resources_props = {}

        for model_name, model_data in resources.items():
            component_props = {}
            for component in model_data[self.resource_mapper["dir"]]:
                if component["type"] in self.non_editable_components:
                    continue
                component_type = self.resource_mapper["children"][component["type"]]

                component_props[component["property"]["name"]] = (component_type, ...)

            component_class_name = f'{model_name.capitalize()}{self.resource_mapper["dir"].capitalize()}{self.resource_type.capitalize()}'
            locals()[component_class_name] = create_model(component_class_name, **component_props)

            resource_class_name = f"{model_name.capitalize()}{self.resource_type.capitalize()}"
            locals()[resource_class_name] = create_model(
                resource_class_name,
                **{self.resource_mapper["dir"]: (locals()[component_class_name], ...)},
                __base__=self.resource_mapper["base"],
            )

            resources_props[model_name] = (locals()[resource_class_name], ...)

        return create_model(f"{self.resource}{self.resource_type.capitalize()}", **resources_props)


class WidgetState(GenerateResourceClass):
    ...


class TableState(GenerateResourceClass):
    ...


def get_resource_data(db: Session, page_id: UUID, resource_model, resource_children_func, child_name):
    page = crud.page.get_object_by_id_or_404(db, id=page_id)

    resources = resource_model.get_page_resources(db, page_id=page.id)
    page_resources = {}

    for resource in resources:
        children = resource_children_func.get_resources(db, resource.id)
        children = [child.__dict__ for child in children]
        page_resources[resource.name] = {"property": resource.property, child_name: children}

    return page_resources


def get_state_context(db: Session, page_id: UUID):
    component_props = get_resource_data(db, page_id, crud.widget, crud.components, WIDGETS, "components")
    table_props = get_resource_data(db, page_id, crud.tables, crud.columns, TABLES, "columns")

    page_props = {**component_props, **table_props}

    print(page_props)

    class State(BaseModel):
        widgets: WidgetState.from_resource_type_and_resource("defined", WIDGETS).get_class_models(
            page_props["Widgets"]
        )
        tables: TableState.from_resource_type_and_resource("defined", TABLES).get_class_models(
            page_props["Tables"]
        )

    class Context(BaseModel):
        widgets: WidgetState.from_resource_type_and_resource("context", WIDGETS).get_class_models(
            page_props["Widgets"]
        )
        tables: TableState.from_resource_type_and_resource("context", TABLES).get_class_models(
            page_props["Tables"]
        )

    return State, Context


# for ui


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
