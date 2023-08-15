from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class BaseComponents(BaseModel):
    code: str
    app_id: UUID
    dataclass: Optional[str]


class ReadComponents(BaseComponents):
    id: UUID
    date: datetime


class CreateComponents(BaseComponents):
    pass


class UpdateComponents(BaseModel):
    code: Optional[str]
    app_id: Optional[UUID]
    dataclass: Optional[str]


class ConvertComponents(BaseModel):
    code: str
    app_id: str
    dataclass: Optional[str]
