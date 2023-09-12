from datetime import datetime
from typing import Dict, List, Literal, Optional, Union
from uuid import UUID

from pydantic import BaseModel

from server.schemas.states import InputDisplayProperties, InputSharedProperties


class InputBaseProperties(BaseModel):
    # read_only
    # ui
    name: Optional[str]
    type: Literal["text", "number", "select"]
    label: Optional[str]
    # ui logic
    required: Optional[bool]
    validation: Optional[str]
    # ui options
    default: Optional[str]
    placeholder: Optional[str]
    # ui events
    rules: Optional[List[Dict]]
    display_rules: Optional[List[Dict]]
    on_change_rules: Optional[List[Dict]]

    on_select: Optional[str]
    on_click: Optional[str]
    on_change: Optional[str]


class InputDefined(InputBaseProperties, InputSharedProperties):
    pass


class InputRead(InputBaseProperties, InputDisplayProperties, InputSharedProperties):
    pass


class Button(BaseModel):
    name: Optional[str]
    on_click: Optional[str]
    # editable
    visible: Optional[bool]


class BaseComponents(BaseModel):
    property: Union[InputDefined, Button]
    widget_id: UUID
    type: str


class ReadComponents(BaseModel):
    id: UUID
    property: Union[InputRead, Button]
    widget_id: UUID
    type: str
    date: datetime


class CreateComponents(BaseModel):
    property: dict
    widget_id: UUID
    type: str


class UpdateComponents(BaseModel):
    property: dict
    type: str
