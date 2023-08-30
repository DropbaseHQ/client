from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class BaseComponents(BaseModel):
    code: str
    widget_id: UUID
    dataclass: Optional[str]


class ReadComponents(BaseComponents):
    id: UUID
    date: datetime


class CreateComponents(BaseComponents):
    pass


class UpdateComponents(BaseModel):
    code: Optional[str]
    widget_id: Optional[UUID]
    dataclass: Optional[str]


class ConvertComponents(BaseModel):
    code: str
    widget_id: str
    dataclass: Optional[str]
