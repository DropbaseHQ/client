from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel

from server.schemas.states import WidgetDisplayProperty, WidgetSharedProperty


class WidgetBaseProperty(BaseModel):
    # read_only
    # ui
    name: Optional[str]
    description: Optional[str]
    error_message: Optional[str]


class WidgetDefinedProperty(WidgetBaseProperty, WidgetSharedProperty):
    pass


class WidgetReadProperty(WidgetBaseProperty, WidgetSharedProperty, WidgetDisplayProperty):
    pass


class BaseWidget(BaseModel):
    name: str
    property: WidgetDefinedProperty
    page_id: UUID


class ReadWidget(BaseModel):
    id: UUID
    name: str
    property: WidgetReadProperty
    page_id: UUID
    date: datetime


class CreateWidget(BaseModel):
    name: Optional[str]
    property: WidgetBaseProperty
    page_id: UUID


class UpdateWidget(BaseModel):
    name: Optional[str]
    property: WidgetBaseProperty
