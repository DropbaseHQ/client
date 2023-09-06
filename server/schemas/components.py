from datetime import datetime
from typing import Any, Callable, Dict, List, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class Input(BaseModel):
    # read_only
    # ui
    name: Optional[str]
    type: Optional[str]
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

    on_select: Optional[Callable[[int], int]]
    on_click: Optional[Callable[[int], int]]
    on_change: Optional[Callable[[int], int]]

    # editable
    options: Optional[Any]
    visible: Optional[bool]
    value: Optional[Any]


class Button(BaseModel):
    name: Optional[str]
    on_click: Optional[Callable[[int], int]]
    # editable
    visible: Optional[bool]


class BaseComponents(BaseModel):
    property: Union[Input, Button]
    widget_id: UUID
    type: str


class ReadComponents(BaseModel):
    id: UUID
    property: Union[Input, Button]
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


# class ConvertComponents(BaseModel):
#     widget_id: str
#     property: Union[Input, Button]
