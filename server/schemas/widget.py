from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class WidgetDisplayProperty(BaseModel):
    message: Optional[str]
    message_type: Optional[str]


class WidgetStateProperty(WidgetDisplayProperty):
    pass


class WidgetBaseProperty(BaseModel):
    # read_only
    # ui
    name: Optional[str]
    description: Optional[str]
    error_message: Optional[str]


class WidgetProperty(WidgetBaseProperty, WidgetDisplayProperty):
    pass


class BaseWidget(BaseModel):
    name: str
    property: WidgetProperty
    page_id: UUID


class ReadWidget(BaseWidget):
    id: UUID
    date: datetime


class CreateWidget(BaseModel):
    name: Optional[str]
    property: WidgetBaseProperty
    page_id: UUID


class UpdateWidget(BaseModel):
    name: Optional[str]
    property: WidgetBaseProperty
