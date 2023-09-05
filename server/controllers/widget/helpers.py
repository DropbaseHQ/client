from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.schemas.components import Button, Input

editable_inputs = ["input"]
component_type_to_schema_mapper = {"input": Input, "button": Button}


def get_user_input(db: Session, widget_id: UUID):
    # get components for widget
    components = crud.components.get_widget_component(db, widget_id)
    # get user input for each component
    user_input = {}
    for component in components:
        if component.type in editable_inputs:
            ComponentClass = component_type_to_schema_mapper[component.type]
            comp = ComponentClass(**component.property)
            user_input[comp.name] = comp.default if comp.default else None
    return user_input
