from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class BaseWidget(BaseModel):
    name: str
    page_id: UUID
    settings: Optional[dict]
    dataclass: Optional[str]


class ReadWidget(BaseWidget):
    id: UUID
    date: datetime


class CreateWidget(BaseWidget):
    pass


class UpdateWidget(BaseModel):
    name: Optional[str]
    page_id: Optional[UUID]
    settings: Optional[dict]
    dataclass: Optional[str]
