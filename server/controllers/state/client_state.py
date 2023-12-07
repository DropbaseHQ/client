from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.controllers.state.models import *


def get_state_context_for_client(db: Session, page_id: UUID):
    page = crud.page.get_object_by_id_or_404(db, id=page_id)

    widget_mapper = {
        "input": InputContextProperty,
        "button": ButtonContextProperty,
        "text": TextContextProperty,
        "select": SelectContextProperty,
    }
    widget_handler = ChildHandler("components", widget_mapper)
    widget_res_handler = ParentHandler(
        "widget", widget_mapper, widget_handler, WidgetContextProperty, "components"
    )

    table_mapper = {"postgres": PgColumnContextProperty, "python": PyColumnContextProperty}
    table_handler = ChildHandler("columns", table_mapper)
    table_res_handler = ParentHandler(
        "tables", table_mapper, table_handler, TableContextProperty, "columns"
    )

    widget_state, widget_context = widget_res_handler.handle(db, page.id)
    table_state, table_context = table_res_handler.handle(db, page.id)
    state = {"widgets": widget_state, "tables": table_state}
    context = {"widgets": widget_context, "tables": table_context}

    return state, context


class ChildHandler:
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


class ParentHandler:
    def __init__(self, resource_name, resource_class, comp_handler, parent_class, child_name):
        self.resource_name = resource_name
        self.resource_class = resource_class
        self.comp_handler = comp_handler
        self.parent_class = parent_class
        self.child_name = child_name

    def handle(self, db, page_id):
        resources = getattr(crud, self.resource_name).get_page_resources(db, page_id)
        state, context = {}, {}
        for resource in resources:
            resource_init = self.parent_class(**resource.property)
            context[resource.name] = resource_init.dict()

            resource_state, resource_contexts = self.comp_handler.handle(db, getattr(resource, "id"))
            state[resource.name] = resource_state
            context[resource.name][self.child_name] = resource_contexts
        return state, context
