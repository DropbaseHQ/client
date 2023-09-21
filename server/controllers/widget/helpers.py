from server import crud
from server.utils.components import (
    component_type_mapper,
    get_component_pydantic_dtype,
    user_input_components,
)


def get_user_input(components):
    # get user input for each component
    user_input = {}
    for component in components:
        if component.type in user_input_components:
            ComponentClass = component_type_mapper[component.type]
            comp = ComponentClass(**component.property)
            user_input[comp.name] = comp.default if comp.default else None
    return user_input


def get_pydantic_model(db, widget_id):
    components = crud.components.get_widget_component(db, widget_id)
    model_str = "class UserInput(BaseModel):\n"
    if len(components) == 0:
        model_str += "    pass\n"
    for component in components:
        if component.type in user_input_components:
            ColumnModel = component_type_mapper[component.type]
            componentModel = ColumnModel(**component.property)
            model_str += (
                f"    {componentModel.name}: Optional[{get_component_pydantic_dtype(componentModel)}]\n"
            )
    return model_str
