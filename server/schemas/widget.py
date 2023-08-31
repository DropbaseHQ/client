from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class BaseWidget(BaseModel):
    name: str
    page_id: UUID
    property: Optional[dict]


class ReadWidget(BaseWidget):
    id: UUID
    date: datetime


class CreateWidget(BaseWidget):
    pass


class UpdateWidget(BaseModel):
    name: Optional[str]
    property: Optional[dict]
