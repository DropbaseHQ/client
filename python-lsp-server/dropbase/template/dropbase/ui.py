from enum import Enum
import json
from typing import Any, Callable, List


class UIComponent:
    def convert_to_json(self):
        return json.dumps({self.__class__.__name__: vars(self)})


class UIInput(UIComponent):
    def __init__(
        self,
        name: str | None = None,
        type: Enum | None = None,
        label: str | None = None,
        required: bool | None = None,
        validation: str | None = None,
        error: str | None = None,
        options: Any | None = None,
        default: str | None = None,
        placeholder: str | None = None,
        role: List[str] | None = None,
        depends: List[str] | None = None,
        style: Enum | None = None,
        number: int | None = None,
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


class UIText(UIComponent):
    def __init__(self, name=None, label=None, value=None, role=None, style=None):
        self.name = name
        self.label = label
        self.value = value
        self.role = role
        self.style = style

    name: str | None
    label: str | None
    value: Callable | None
    role: List[str] | None
    style: str | None


class UIButton(UIComponent):
    def __init__(self, name=None, label=None, role=None, width=None, action=None):
        self.name = name
        self.label = label
        self.role = role
        self.width = width
        self.action = action

    name: str | None
    label: str | None
    role: List[str] | None
    width: str | None
    action: Callable | None
