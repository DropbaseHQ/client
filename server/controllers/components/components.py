import logging

from fastapi import Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from server import crud
from server.schemas.components import ConvertComponents, CreateComponents, UpdateComponents

from .parse import GeneratedUIComponent, extract_class_instantiations

logger = logging.getLogger(__name__)


def generate_ui_json(ui_classes: list[GeneratedUIComponent]):
    from .ui_components import UIButton, UIInput, UIText

    ui_jsons = []
    for ui_class in ui_classes:
        class_type = locals().get(ui_class.class_name)
        if class_type is None:
            logger.warning(f"Class {ui_class.class_name} not found")
            continue
        logger.info(f"class_type: {class_type}")
        ui_comp = class_type(**ui_class.kwargs)
        jsonified_comp = ui_comp.convert_to_json()
        ui_jsons.append(jsonified_comp)
    return ui_jsons


def convert_components(request: ConvertComponents, response: Response):
    try:
        generated_classes = extract_class_instantiations(request.code)
        logger.info(f"generated_classes: {generated_classes}")
        ui_jsons = generate_ui_json(generated_classes)
        return {"components": ui_jsons}
    except Exception as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        logger.error(e)
        return {"error": str(e)}


def create_components(db: Session, request: CreateComponents):
    dataclass = create_component_dataclass(db, request.code)
    request.dataclass = dataclass
    return crud.components.create(db, obj_in=request)


def update_components(db: Session, request: UpdateComponents, components_id: str):
    dataclass = create_component_dataclass(db, request.code)
    request.dataclass = dataclass
    return crud.components.update_by_pk(db=db, pk=components_id, obj_in=request)


type_mapper = {"text": "str", "number": "int", "select": "str"}


def create_component_dataclass(db: Session, code: str):
    generated_classes = extract_class_instantiations(code)
    user_inputs = []
    for generated_class in generated_classes:
        if generated_class.class_name == "Input":
            user_inputs.append(
                {"name": generated_class.kwargs.get("name"), "type": generated_class.kwargs.get("type")}
            )

    dataclass_string = "from pydantic import BaseModel\n"
    dataclass_string += "class UserInput(BaseModel):\n"

    for user_input in user_inputs:
        dataclass_string += f"    {user_input['name']}: {type_mapper[user_input['type']]}\n"
    return dataclass_string
