from server.controllers.components.parse import GeneratedUIComponent, extract_class_instantiations


# Returns UI classes with the 'type' attribute (like UIInput)
def generate_state_ui_class(ui_classes: list[GeneratedUIComponent]):
    # Used for locals()
    from server.controllers.components.ui_components import UIButton, UIInput, UIText

    typed_components = []
    for ui_class in ui_classes:
        class_type = locals().get(ui_class.class_name)
        if class_type is None:
            continue
        ui_comp = class_type(**ui_class.kwargs)

        typed_components.append(ui_comp)
    return typed_components


def get_table_state_class_string() -> str:
    cls_str =  "class TableState(BaseModel)\n"
    cls_str += "    toast: str\n"
    cls_str += "    toast_type: str\n"
    cls_str += "    message: str\n"
    cls_str += "    message_type: str\n"
    cls_str += "    refresh: Optional[bool]\n"
    return cls_str


def get_tables_string() -> str:
    return ""


def get_component_state_class_string() -> str:
    cls_str =  "class ComponentState(BaseModel):\n"
    cls_str += "    error_message: Optional[str]\n"
    cls_str += "    options: Optional[Any]\n"
    cls_str += "    value: Optional[Any]\n"
    cls_str += "    visible: Optional[bool]\n"
    return cls_str


def get_components_string(ui_components) -> str:
    cls_str = "class Components(BaseModel):\n"
    for component in ui_components:
        cls_str += f"    {component.name}: ComponentState\n"


def get_sidebar_state_class_string() -> str:
    cls_str =  "class SidebarState(BaseModel):\n"
    cls_str += "    components: Components\n"
    cls_str += "    toast: str\n"
    cls_str += "    toast_type: str\n"
    cls_str += "    message: str\n"
    cls_str += "    message_type: str\n"
    return cls_str


def get_state_class_string() -> str:
    cls_str = "class State(BaseModel):\n"
    cls_str += "    sidebar: SidebarState\n"
    cls_str += "    tables: Tables\n"
    return cls_str


def get_state_instantiation_string() -> str:
    """
    State(
        sidebar = SidebarState(
            TODO,
            toast = "",
            toast_type = "",
            message = "",
            message_type = ""
        ),
        tables = Tables(
            TODO
        )
    )
    """
    return ""


def get_state_content_string(ui_components) -> str:
    content_str =  "from typing import Any, Optional\n" 
    content_str += "from pydantic import BaseModel\n"
    content_str += get_table_state_class_string()
    content_str += get_tables_string()
    content_str += get_component_state_class_string()
    content_str += get_components_string(ui_components)
    content_str += get_sidebar_state_class_string()
    content_str += get_state_class_string()
    content_str += get_state_instantiation_string()
    return content_str


def generate(code_string) -> str | None:
    try:
        instantiations = extract_class_instantiations(code_string)
        typed_ui_classes = generate_state_ui_class(instantiations)
        generated_code = get_state_content_string(typed_ui_classes)
    except Exception:
        return None  # i.e. do not write anything
    return generated_code
