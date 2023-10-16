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
    page_widgets = get_component_props(db, page_id)
    # compose defined context and state
    class_generator = GenerateReourceClass(resource_type="defined", resource="Widgets")
    WidgetState = class_generator.get_state_class(page_widgets.get("widgets"))
    class_generator = GenerateReourceClass(resource_type="defined", resource="Tables")
    TableState = class_generator.get_state_class(page_widgets.get("tables"))

    class State(BaseModel):
        widgets: WidgetState
        tables: TableState

    class_generator = GenerateReourceClass(resource_type="context", resource="Widgets")
    WidgetContext = class_generator.get_defined_context_class(page_widgets.get("widgets"))
    class_generator = GenerateReourceClass(resource_type="context", resource="Tables")
    TablesContext = class_generator.get_defined_context_class(page_widgets.get("tables"))

    class Context(BaseModel):
        widgets: WidgetContext
        tables: TablesContext

    return State, Context


# REFERENCE
# page_widgets = {
#     "widgets": {
#         "widget1" : {
#             "props": {"name": "widget1", "description": "This is a widget1"},
#             "components": [
#                 {"props":{"name": "input1", "type": "text", "label": "Input 1", "required": True}, "type": "input"},
#                 {"props":{"name": "input2", "type": "number", "label": "Input 2", "required": True}, "type": "input"},
#             ],
#         },
#         "widget2" : {
#             "props": {"name": "widget2", "description": "This is a widget1"},
#             "components": [
#                 {"props":{"name": "input1", "label": "Input 1", "required": True}, "type": "input"},
#                 {"props":{"name": "input2", "label": "Input 2", "required": True}, "type": "input"},
#             ],
#         }
#     },
#     "tables": {
#         "table1": {
#             "props": {"name":"table1", "source":"another one", "code":"sql1.sql", "type":"sql"},
#             "columns": [
#                 {
#                     "props":{
#                         "name":"name",
#                         "schema_name":"public",
#                         "table_name":"table1",
#                         "column_name":"name",
#                         "type":"VARCHAR",
#                         "primary_key":False,
#                         "editable":True,
#                         "visible":True,
#                         "unique":False,
#                     },
#                     "type": "postgres"
#                 },
#                 {
#                     "props":{
#                         "name":"age",
#                         "schema_name":"public",
#                         "table_name":"table1",
#                         "column_name":"age",
#                         "type":"INTEGER",
#                         "primary_key":False,
#                         "editable":True,
#                         "visible":True,
#                         "unique":False,
#                     },
#                     "type": "postgres"
#                 },
#             ],
#         }
#     }
# }
