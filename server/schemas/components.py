from datetime import datetime
from typing import Annotated, Any, List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel

from server.controllers.state.models import (
    ButtonSharedProperties,
    ComponentDisplayProperties,
    InputSharedProperties,
    SelectSharedProperties,
    TextSharedProperties,
)
from server.schemas.properties import PropertyCategory


class InputBaseProperties(BaseModel):
    name: Annotated[str, PropertyCategory.default]
    label: Annotated[Optional[str], PropertyCategory.default]
    type: Annotated[Optional[Literal["text", "number", "date"]], PropertyCategory.default] = "text"
    placeholder: Annotated[Optional[str], PropertyCategory.default]

    # display rules
    display_rules: Annotated[Optional[List[str]], PropertyCategory.display_rules]

    # validation
    validation_rules: Annotated[Optional[List[str]], PropertyCategory.validation]

    # other
    required: Annotated[Optional[bool], PropertyCategory.other]
    default: Annotated[Optional[Any], PropertyCategory.other]


class InputDefined(InputBaseProperties, InputSharedProperties):
    pass


class InputRead(InputBaseProperties, ComponentDisplayProperties, InputSharedProperties):
    pass


class SelectBaseProperties(BaseModel):
    name: Annotated[str, PropertyCategory.default]
    label: Annotated[Optional[str], PropertyCategory.default]

    # events
    on_change: Annotated[Optional[str], PropertyCategory.events]

    # display_rules
    display_rules: Annotated[Optional[List[str]], PropertyCategory.display_rules]

    # other
    required: Annotated[Optional[bool], PropertyCategory.other]
    default: Annotated[Optional[Any], PropertyCategory.other]


class SelectDefined(SelectBaseProperties, SelectSharedProperties):
    pass


class SelectRead(SelectBaseProperties, ComponentDisplayProperties, SelectSharedProperties):
    pass


class ButtonBaseProperties(BaseModel):
    name: Annotated[str, PropertyCategory.default]
    label: Annotated[Optional[str], PropertyCategory.default]
    color: Annotated[
        Optional[
            Literal[
                "red", "blue", "green", "yellow", "black", "white", "grey", "orange", "purple", "pink"
            ]
        ],
        PropertyCategory.default,
    ]

    # events
    on_click: Annotated[Optional[str], PropertyCategory.events]

    # display rules
    display_rules: Annotated[Optional[List[str]], PropertyCategory.display_rules]


class ButtonDefined(ButtonBaseProperties, ButtonSharedProperties):
    pass


class ButtonRead(ButtonBaseProperties, ComponentDisplayProperties, ButtonSharedProperties):
    pass


class TextBaseProperties(BaseModel):
    name: Annotated[str, PropertyCategory.default]
    text: Annotated[Optional[str], PropertyCategory.default]
    size: Annotated[Optional[Literal["small", "medium", "large"]], PropertyCategory.default]
    color: Annotated[
        Optional[
            Literal[
                "red", "blue", "green", "yellow", "black", "white", "grey", "orange", "purple", "pink"
            ]
        ],
        PropertyCategory.default,
    ]

    # display_rules
    display_rules: Annotated[Optional[List[str]], PropertyCategory.display_rules]


class TextDefined(TextBaseProperties, TextSharedProperties):
    pass


class TextRead(TextBaseProperties, TextSharedProperties):
    pass


class BaseComponents(BaseModel):
    property: dict  # Union[InputDefined, SelectDefined, ButtonDefined, TextDefined]
    widget_id: UUID
    after: Optional[UUID]
    type: str


class ReadComponents(BaseModel):
    id: UUID
    property: dict  # Union[InputDefined, SelectDefined, ButtonDefined, TextDefined]
    widget_id: UUID
    after: Optional[UUID]
    type: str
    date: datetime


class CreateComponents(BaseModel):
    property: dict  # Union[InputDefined, SelectDefined, ButtonDefined, TextDefined]
    widget_id: UUID
    after: Optional[UUID]
    type: str


class UpdateComponents(BaseModel):
    property: dict  # Union[InputDefined, SelectDefined, ButtonDefined, TextDefined]
    type: str


class ReorderComponents(BaseModel):
    widget_id: UUID
    component_id: UUID
    after: Optional[UUID]
