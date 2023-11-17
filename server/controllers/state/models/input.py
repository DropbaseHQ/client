from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel

from .common import ComponentDisplayProperties


class InputBaseProperties(BaseModel):
    name: str
    type: Optional[Literal["text", "number", "date"]] = "text"
    label: Optional[str]
    # ui logic
    required: Optional[bool]
    validation_rules: Optional[List[Dict]]
    # ui options
    default: Optional[Any]
    placeholder: Optional[str]
    # ui events
    display_rules: Optional[List[Dict]]

    @property
    def state(self):
        match self.type:
            case "text":
                return str
            case "number":
                return float
            case "date":
                return str
            case _:
                return Any


class InputSharedProperties(BaseModel):
    # visible: Optional[bool]
    value: Optional[str]


class InputDefinedProperty(InputBaseProperties, InputSharedProperties):
    pass


class InputContextProperty(ComponentDisplayProperties, InputSharedProperties):
    pass
