from typing import Any, List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, create_model
from sqlalchemy.orm import Session

from server import crud
from server.controllers.state.models import *


def get_state_context(db: Session, page_id: UUID):

    widgets = get_resource_data(db, page_id, crud.widget, crud.components, "components")
    tables = get_resource_data(db, page_id, crud.tables, crud.columns, "columns")

    # compose defined context and state
    WidgetState = get_state_class(resource_type="defined", resource="Widgets", resources=widgets)
    TableState = get_state_class(resource_type="defined", resource="Tables", resources=tables)
    TableFilters = get_filters_state_class(tables)

    class State(BaseModel):
        widgets: WidgetState
        tables: TableState
        filters: TableFilters

    WidgetContext = get_context_class(resource_type="context", resource="Widgets", resources=widgets)
    TablesContext = get_context_class(resource_type="context", resource="Tables", resources=tables)

    class Context(BaseModel):
        widgets: WidgetContext
        tables: TablesContext

    return State, Context


def get_resource_data(db: Session, page_id: UUID, parent_crud, child_crud, child_name):
    # returns a dict of resources with their children
    # ex: {"widget1": "property": {}, "components": {"input": {}, "button": {}}}
    resources = parent_crud.get_page_resources(db, page_id=page_id)
    page_resources = {}
    for resource in resources:
        children = child_crud.get_resources(db, resource.id)
        children = [comp.__dict__ for comp in children]
        page_resources[resource.name] = {"property": resource.property, child_name: children}
    return page_resources


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


def get_context_class(resource_type, resource, resources):
    resource_mapper = base_property_mapper.get(resource_type).get(resource)
    BaseProperty = resource_mapper.get("base")
    children_dir = resource_mapper.get("dir")

    resources_props = {}

    for resource_name, resource_data in resources.items():

        components_props = {}
        for component in resource_data[children_dir]:
            components_props[component["property"]["name"]] = (
                resource_mapper.get("children").get(component["type"]),
                ...,
            )

        components_class_name = (
            resource_name.capitalize() + children_dir.capitalize() + resource_type.capitalize()
        )
        locals()[components_class_name] = create_model(components_class_name, **components_props)

        resource_class_name = resource_name.capitalize() + resource_type.capitalize()
        locals()[resource_class_name] = create_model(
            resource_class_name,
            **{children_dir: (locals()[components_class_name], ...)},
            __base__=BaseProperty
        )

        resources_props[resource_name] = (locals()[resource_class_name], ...)

    # compose Widgets
    return create_model(resource + resource_type.capitalize(), **resources_props)


def get_filters_state_class(tables):
    filters = {}
    for table_name in tables.keys():
        filter_sort_model = create_filters_class(table_name)
        filters[table_name] = (filter_sort_model, Field(default=None))

    FiltersSortsModel = create_model("FilterSorts", **filters)
    return FiltersSortsModel


def create_filters_class(table_name):
    TableFilterDict = {
        "column_name": (str, ...),
        "condition": (Literal["=", ">", "<", ">=", "<=", "like", "in"], ...),
        "value": (Any, ...),
    }

    TableSortDict = {"column_name": (str, ...), "value": (Literal["asc", "desc"], ...)}

    Filters = create_model(table_name.capitalize() + "Filters", **TableFilterDict)
    Sorts = create_model(table_name.capitalize() + "Sorts", **TableSortDict)

    FiltersSortsDict = {
        "filters": (List[Optional[Filters]], []),
        "sorts": (List[Optional[Sorts]], []),
    }

    FiltersSorts = create_model(table_name.capitalize() + "FiltersSorts", **FiltersSortsDict)
    return FiltersSorts


def get_state_class(resource_type, resource, resources):

    non_editable = non_editable_components.get(resource)
    resource_mapper = base_property_mapper.get(resource_type).get(resource)
    children_dir = resource_mapper.get("dir")

    resources_props = {}

    for resource_name, resource_data in resources.items():
        components_props = {}
        for component in resource_data[children_dir]:
            if component["type"] in non_editable:
                continue
            # to find a state type, component must be first initiated
            component_type = resource_mapper.get("children").get(component["type"])
            # initiate component
            init_component = component_type(**component["property"])
            # state is pulled from ComponentDefined class
            components_props[component["property"]["name"]] = (init_component.state, Field(default=None))

        resource_class_name = resource_name.capitalize() + "State"
        locals()[resource_class_name] = create_model(resource_class_name, **components_props)

        resources_props[resource_name] = (locals()[resource_class_name], ...)

    # compose Widgets
    return create_model(resource + "State", **resources_props)
