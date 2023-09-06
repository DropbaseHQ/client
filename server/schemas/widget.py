from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class WidgetProperty(BaseModel):
    # read_only
    # ui
    name: Optional[str]
    description: Optional[str]
    error_message: Optional[str]


class BaseWidget(BaseModel):
    name: str
    property: WidgetProperty
    page_id: UUID


class ReadWidget(BaseWidget):
    id: UUID
    date: datetime


class CreateWidget(BaseModel):
    name: Optional[str]
    property: WidgetProperty
    page_id: UUID


class UpdateWidget(BaseModel):
    name: Optional[str]
    property: WidgetProperty
