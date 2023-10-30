from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field

from server.schemas.states import (
    ButtonSharedProperties,
    ComponentDisplayProperties,
    InputSharedProperties,
    SelectSharedProperties,
    TextSharedProperties,
)

DisplayRules = List[str]


class InputBaseProperties(BaseModel):
    name: str
    type: Optional[Literal["text", "number", "date"]] = "text"
    label: Optional[str]
    placeholder: Optional[str]

    # events
    on_change: Optional[str]

    # display rules
    display_rules: Optional[DisplayRules]

    # validation
    validation_rules: Optional[List[str]]

    # other
    required: Optional[bool]
    default: Optional[Any]


class InputDefined(InputBaseProperties, InputSharedProperties):
    pass


class InputRead(InputBaseProperties, ComponentDisplayProperties, InputSharedProperties):
    pass


class SelectBaseProperties(BaseModel):
    name: str
    label: Optional[str]

    # events
    on_change: Optional[str]

    # display_rules
    display_rules: Optional[DisplayRules]

    # other
    required: Optional[bool]
    default: Optional[Any]


class SelectDefined(SelectBaseProperties, SelectSharedProperties):
    pass


class SelectRead(SelectBaseProperties, ComponentDisplayProperties, SelectSharedProperties):
    pass


class ButtonBaseProperties(BaseModel):
    name: str
    label: Optional[str]
    color: Optional[
        Literal["red", "blue", "green", "yellow", "black", "white", "grey", "orange", "purple", "pink"]
    ]

    # events
    on_click: Optional[str]

    # display rules
    display_rules: Optional[DisplayRules]


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

    # display_rules
    display_rules: Optional[DisplayRules]


class TextDefined(TextBaseProperties, TextSharedProperties):
    pass


class TextRead(TextBaseProperties, TextSharedProperties):
    pass


class BaseComponents(BaseModel):
    property: Union[InputDefined, SelectDefined, ButtonDefined, TextDefined]
    widget_id: UUID
    after: Optional[UUID]
    type: str


class ReadComponents(BaseModel):
    id: UUID
    property: Union[InputDefined, SelectDefined, ButtonDefined, TextDefined]
    widget_id: UUID
    after: Optional[UUID]
    type: str
    date: datetime


class CreateComponents(BaseModel):
    property: Union[InputDefined, SelectDefined, ButtonDefined, TextDefined]
    widget_id: UUID
    after: Optional[UUID]
    type: str


class UpdateComponents(BaseModel):
    property: Union[InputDefined, SelectDefined, ButtonDefined, TextDefined]
    type: str


class ReorderComponents(BaseModel):
    widget_id: UUID
    component_id: UUID
    after: Optional[UUID]
