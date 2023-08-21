from enum import Enum
import json


class UIComponent:
    def convert_to_json(self):
        return json.dumps(vars(self))


class UIInput(UIComponent):
    def __init__(
        self,
        name: str = None,
        type: Enum = None,
        label: str = None,
        required: bool = None,
        validation: str = None,
        error: str = None,
        options: any = None,
        default: str = None,
        placeholder: str = None,
        role: list[str] = None,
        depends: list[str] = None,
        style: Enum = None,
        number: int = None,
        depends_value: any = None,
        rules: list[dict] = None,
        display_rules: list[dict] = None,
        action_rules: list[dict] = None,
        on_select: str = None,
    ):
        self.name = name
        self.type = type
        self.label = label
        self.required = required
        self.validation = validation
        self.error = error
        self.options = options
        self.default = default
        self.placeholder = placeholder
        self.role = role
        self.depends = depends
        self.style = style
        self.number = number
        self.depends_value = depends_value
        self.rules = rules
        self.display_rules = display_rules
        self.action_rules = action_rules
        self.on_select = on_select


class UIText(UIComponent):
    def __init__(self, name=None, label=None, value=None, role=None, style=None):
        self.name = name
        self.label = label
        self.value = value
        self.role = role
        self.style = style
        self.type = "text"

    name: str
    label: str
    value: callable
    role: list[str]
    style: str
    type: str = "text"


class UIButton(UIComponent):
    def __init__(
        self,
        name=None,
        label=None,
        role=None,
        width=None,
        action=None,
        depends=None,
        depends_value=None,
        rules: list[dict] = None,
    ):
        self.name = name
        self.label = label
        self.role = role
        self.width = width
        self.action = action
        self.depends = depends
        self.depends_value = depends_value
        self.type = "button"
        self.rules: rules

    name: str
    label: str
    role: list[str]
    width: str
    action: callable
    depends: list[str]
    depends_value: any
    type: str = "button"
