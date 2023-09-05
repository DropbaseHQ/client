from server.controllers.components.parse import GeneratedUIComponent, extract_class_instantiations


# Returns UI classes with the 'type' attribute (like UIInput)
def generate_state_ui_class(ui_classes: list[GeneratedUIComponent]):
    # Used for locals()
    from server.controllers.components.schemas import UIButton, UIInput, UIText

    typed_components = []
    for ui_class in ui_classes:
        class_type = locals().get(ui_class.class_name)
        if class_type is None:
            continue
        ui_comp = class_type(**ui_class.kwargs)

        typed_components.append(ui_comp)
    return typed_components


def get_class_declaration_string(class_name, ui_components):
    cls_str = "from .ui import *\n"
    cls_str += "from dataclasses import dataclass\n"
    cls_str += "@dataclass\n"
    cls_str += f"class {class_name}:\n"
    cls_str += "    sidebar: UISidebar\n"
    for comp in ui_components:
        cls_str += f"    {comp.name}: {comp.__class__.__name__}\n"
    cls_str += "sidebar = UISidebar()\n"
    cls_str += "state = UIState()\n"
    return cls_str


def generate(code_string) -> str | None:
    try:
        instantiations = extract_class_instantiations(code_string)
        typed_ui_classes = generate_state_ui_class(instantiations)
        generated_code = get_class_declaration_string("UIState", typed_ui_classes)
    except Exception:
        return None  # i.e. do not write anything
    return generated_code
