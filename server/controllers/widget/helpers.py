from server import crud
from server.schemas.components import Button, InputBaseProperties

editable_inputs = ["input"]
component_type_to_schema_mapper = {"input": InputBaseProperties, "button": Button}


def get_user_input(components):
    # get user input for each component
    user_input = {}
    for component in components:
        if component.type in editable_inputs:
            ComponentClass = component_type_to_schema_mapper[component.type]
            comp = ComponentClass(**component.property)
            user_input[comp.name] = comp.default if comp.default else None
    return user_input


input_pydantic_dtype_mapper = {"text": "str", "number": "float", "select": "str"}
component_type_mapper = {"input": InputBaseProperties}
input_types = ["input"]


def get_pydantic_model(db, widget_id):
    components = crud.components.get_widget_component(db, widget_id)
    model_str = "class UserInput(BaseModel):\n"
    for comp in components:
        if comp.type not in input_types:
            continue

        ColumnModel = component_type_mapper[comp.type]
        component = ColumnModel(**comp.property)
        model_str += f"    {component.name}: Optional[{input_pydantic_dtype_mapper[component.type]}]\n"
    return model_str
