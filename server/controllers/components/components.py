import logging
from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.schemas.components import Button, CreateComponents, Input, UpdateComponents
from server.utils.converter import get_class_properties

logger = logging.getLogger(__name__)


editable_inputs = ["input"]
component_type_to_schema_mapper = {"input": Input, "button": Button}


def create_component(db: Session, request: CreateComponents):
    ComponentClass = component_type_to_schema_mapper[request.type]
    ComponentClass(**request.property)
    # request.property = component
    return crud.components.create(db, obj_in=request)


def update_component(db: Session, components_id: UUID, request: UpdateComponents):
    ComponentClass = component_type_to_schema_mapper[request.type]
    component = ComponentClass(**request.property)
    request.property = component.dict()
    return crud.components.update_by_pk(db=db, pk=components_id, obj_in=request)


def get_widget_components_and_props(db: Session, widget_id: UUID):
    components = crud.components.get_widget_component(db, widget_id=widget_id)
    column_props = get_class_properties(Input)
    return {"schema": column_props, "values": components}


# type_mapper = {"text": "str", "number": "int", "select": "str"}
# def create_component_dataclass(db: Session, code: str):
#     generated_classes = extract_class_instantiations(code)
#     user_inputs = []
#     for generated_class in generated_classes:
#         if generated_class.class_name == "Input":
#             user_inputs.append(
#                 {"name": generated_class.kwargs.get("name"), "type": generated_class.kwargs.get("type")}
#             )

#     dataclass_string = "from pydantic import BaseModel\n"
#     dataclass_string += "class UserInput(BaseModel):\n"

#     for user_input in user_inputs:
#         dataclass_string += f"    {user_input['name']}: {type_mapper[user_input['type']]}\n"
#     return dataclass_string
# def generate_ui_json(ui_classes: list[GeneratedUIComponent]):
#     from .schemas import UIButton, UIInput, UIText

#     ui_jsons = []
#     for ui_class in ui_classes:
#         class_type = locals().get(ui_class.class_name)
#         if class_type is None:
#             logger.warning(f"Class {ui_class.class_name} not found")
#             continue
#         logger.info(f"class_type: {class_type}")
#         ui_comp = class_type(**ui_class.kwargs)
#         jsonified_comp = ui_comp.convert_to_json()
#         ui_jsons.append(jsonified_comp)
#     return ui_jsons
# def convert_components(request: ConvertComponents, response: Response):
#     try:
#         generated_classes = extract_class_instantiations(request.code)
#         logger.info(f"generated_classes: {generated_classes}")
#         ui_jsons = generate_ui_json(generated_classes)
#         return {"components": ui_jsons}
#     except Exception as e:
#         response.status_code = status.HTTP_400_BAD_REQUEST
#         logger.error(e)
#         return {"error": str(e)}
