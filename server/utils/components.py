from server.schemas.components import (
    ButtonBaseProperties,
    InputBaseProperties,
    SelectBaseProperties,
    TextBaseProperties,
)
from server.schemas.states import (
    ButtonStateProperties,
    InputStateProperties,
    SelectStateProperties,
    TextStateProperties,
)

editable_inputs = ["input", "select"]
component_type_mapper = {
    "input": InputBaseProperties,
    "select": SelectBaseProperties,
    "text": TextBaseProperties,
    "button": ButtonBaseProperties,
}
state_component_type_mapper = {
    "input": InputStateProperties,
    "select": SelectStateProperties,
    "text": TextStateProperties,
    "button": ButtonStateProperties,
}
input_pydantic_dtype_mapper = {"text": "str", "number": "float", "select": "str"}
