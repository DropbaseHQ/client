from server.controllers.state.models import (
    ButtonContextProperty,
    ButtonDefinedProperty,
    InputBaseProperties,
    InputContextProperty,
    InputDefinedProperty,
    SelectBaseProperties,
    SelectContextProperty,
    SelectDefinedProperty,
    TextContextProperty,
    TextDefinedProperty,   
)
from server.schemas.components import CreateComponents
from server import crud
from sqlalchemy.orm import Session

user_input_components = ["input", "select"]
state_update_components = ["input", "select", "button"]

component_type_mapper = {
    "input": InputDefinedProperty,
    "select": SelectDefinedProperty,
    "text": TextDefinedProperty,
    "button": ButtonDefinedProperty,
}
state_component_type_mapper = {
    "input": InputContextProperty,
    "select": SelectContextProperty,
    "text": TextContextProperty,
    "button": ButtonContextProperty,
}
input_pydantic_dtype_mapper = {"text": "str", "number": "float", "select": "str"}


def get_component_pydantic_dtype(component):
    if type(component) is SelectBaseProperties:
        return "str"
    if type(component) is InputBaseProperties:
        if component.type == "number":
            return "float"
        else:
            return "str"
    else:
        return "Any"


def process_after_property(db: Session, component: CreateComponents):
    last_component = crud.components.get_last_component(db, component.widget_id)
    if last_component:
        component.after = last_component.id
    return component


def order_components(components):
    if len(components) == 0:
        return []
    after_dict = {}
    first = None
    for component in components:
        if component.after:
            after_dict[component.after] = component.id
        else:
            first = component.id

    comp_dict = {component.id: component for component in components}
    result = [comp_dict[first]]
    for _ in range(len(comp_dict.keys()) - 1):
        last_component = result[-1]
        next_comp_id = after_dict[last_component.id]
        result.append(comp_dict[next_comp_id])

    return result
