from server.schemas.components import (
    ButtonDefined,
    InputBaseProperties,
    InputDefined,
    SelectBaseProperties,
    SelectDefined,
    TextDefined,
)
from server.schemas.states import (
    ButtonStateProperties,
    InputStateProperties,
    SelectStateProperties,
    TextStateProperties,
)

user_input_components = ["input", "select"]
state_update_components = ["input", "select", "button"]

component_type_mapper = {
    "input": InputDefined,
    "select": SelectDefined,
    "text": TextDefined,
    "button": ButtonDefined,
}
state_component_type_mapper = {
    "input": InputStateProperties,
    "select": SelectStateProperties,
    "text": TextStateProperties,
    "button": ButtonStateProperties,
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
