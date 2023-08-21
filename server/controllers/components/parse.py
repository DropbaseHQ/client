import ast
import logging

from pydantic import BaseModel

logger = logging.getLogger(__name__)


class GeneratedUIComponent(BaseModel):
    class_name: str
    kwargs: dict


def extract_class_instantiations(code_string: str) -> list[GeneratedUIComponent]:
    """Extracts class instantiations from a string of code. This means that
    it will only look for lines of code that look like this:
    `variable_name = ClassName(arg1, arg2, kwarg1=value1, kwarg2=value2)`
    """
    generated_class_instances = []
    parsed_tree = ast.parse(code_string)
    for node in ast.walk(parsed_tree):
        if isinstance(node, ast.Assign) and isinstance(node.value, ast.Call):
            class_name = node.value.func.id
            kwargs = {}
            for keyword in node.value.keywords:
                keyword_value = ast.literal_eval(keyword.value)
                kwargs[keyword.arg] = keyword_value

            generated_class_instances.append(GeneratedUIComponent(class_name=class_name, kwargs=kwargs))

    return generated_class_instances


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
