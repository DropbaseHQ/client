from enum import Enum
import json


class UIComponent:
    def convert_to_json(self):
        return json.dumps({self.__class__.__name__: vars(self)})


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


class UIText(UIComponent):
    def __init__(self, name=None, label=None, value=None, role=None, style=None):
        self.name = name
        self.label = label
        self.value = value
        self.role = role
        self.style = style

    name: str
    label: str
    value: callable
    role: list[str]
    style: str


class UIButton(UIComponent):
    def __init__(
        self, name=None, label=None, role=None, width=None, action=None, depends=None, depends_value=None
    ):
        self.name = name
        self.label = label
        self.role = role
        self.width = width
        self.action = action
        self.depends = depends
        self.depends_value = depends_value

    name: str
    label: str
    role: list[str]
    width: str
    action: callable
    depends: list[str]
    depends_value: any
