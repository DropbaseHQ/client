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
    if type(component) == SelectBaseProperties:
        return "str"
    if type(component) == InputBaseProperties:
        if component.type == "number":
            return "float"
        else:
            return "str"
    else:
        return "Any"
