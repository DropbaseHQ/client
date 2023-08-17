from server.controllers.components import GeneratedUIComponent, extract_class_instantiations

map_ui_type_to_dtype = {
    "select": "str",
    "text": "str",
    "number": "float",
    "integer": "int",
    "date": "datetime",
    "time": "datetime",
    "datetime": "datetime",
    "checkbox": "bool",
    "radio": "str",
    "input": "str",
}


# Returns UI classes with the 'type' attribute (like UIInput)
def generate_typed_ui_classes(ui_classes: list[GeneratedUIComponent]):
    # Used for locals()
    from server.controllers.components.ui_components import UIButton, UIInput, UIText

    typed_components = []
    for ui_class in ui_classes:
        class_type = locals().get(ui_class.class_name)
        if class_type is None:
            continue
        ui_comp = class_type(**ui_class.kwargs)

        component_type = getattr(ui_comp, "type", None)
        if component_type is None:
            continue

        typed_components.append(ui_comp)
    return typed_components


def get_class_declaration_string(class_name, ui_components):
    cls_str = "from dataclasses import dataclass\n"
    cls_str += "@dataclass\n"
    cls_str += f"class {class_name}:\n"
    for comp in ui_components:
        cls_str += f"    {comp.name}: {map_ui_type_to_dtype[comp.type]}\n"
    return cls_str


def generate(code_string) -> str | None:
    try:
        instantiations = extract_class_instantiations(code_string)
        typed_ui_classes = generate_typed_ui_classes(instantiations)
        generated_code = get_class_declaration_string("UserInput", typed_ui_classes)
    except Exception:
        return None  # i.e. do not write anything
    return generated_code
