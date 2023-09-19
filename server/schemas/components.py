from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Union
from uuid import UUID

from pydantic import BaseModel

from server.schemas.states import (
    ButtonSharedProperties,
    ComponentDisplayProperties,
    InputSharedProperties,
    SelectSharedProperties,
    TextSharedProperties,
)


class InputBaseProperties(BaseModel):
    name: str
    type: Optional[Literal["text", "number", "date"]] = "text"
    label: Optional[str]
    # ui logic
    required: Optional[bool]
    validation: Optional[str]
    # ui options
    default: Optional[Any]
    placeholder: Optional[str]
    # ui events
    rules: Optional[List[Dict]]


class InputDefined(InputBaseProperties, InputSharedProperties):
    pass


class InputRead(InputBaseProperties, ComponentDisplayProperties, InputSharedProperties):
    pass


class SelectBaseProperties(BaseModel):
    name: str
    # multi: bool
    label: Optional[str]
    # ui logic
    required: Optional[bool]
    validation: Optional[str]
    # ui options
    default: Optional[Any]
    # ui events
    rules: Optional[List[Dict]]
    # server calls
    on_change: Optional[str]


class SelectDefined(SelectBaseProperties, SelectSharedProperties):
    pass


class SelectRead(SelectBaseProperties, ComponentDisplayProperties, SelectSharedProperties):
    pass


class ButtonBaseProperties(BaseModel):
    name: str
    label: Optional[str]
    # editable
    visible: Optional[bool]
    # server call
    on_click: Optional[str]


class ButtonDefined(ButtonBaseProperties, ButtonSharedProperties):
    pass


class ButtonRead(ButtonBaseProperties, ComponentDisplayProperties, ButtonSharedProperties):
    pass


class TextBaseProperties(BaseModel):
    name: str
    text: Optional[str]
    size: Optional[Literal["small", "medium", "large"]]
    color: Optional[
        Literal["red", "blue", "green", "yellow", "black", "white", "grey", "orange", "purple", "pink"]
    ]


class TextDefined(TextBaseProperties, TextSharedProperties):
    pass


class TextRead(TextBaseProperties, TextSharedProperties):
    pass


class BaseComponents(BaseModel):
    property: Union[InputDefined, SelectDefined, ButtonDefined, TextDefined]
    widget_id: UUID
    type: str


class ReadComponents(BaseModel):
    id: UUID
    property: Union[InputDefined, SelectDefined, ButtonDefined, TextDefined]
    widget_id: UUID
    type: str
    date: datetime


class CreateComponents(BaseModel):
    property: dict  # Union[InputDefined, SelectDefined, ButtonDefined, TextDefined]
    widget_id: UUID
    type: str


class UpdateComponents(BaseModel):
    property: dict
    type: str
