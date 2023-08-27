from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class BaseComponents(BaseModel):
    code: str
    action_id: UUID
    dataclass: Optional[str]


class ReadComponents(BaseComponents):
    id: UUID
    date: datetime


class CreateComponents(BaseComponents):
    pass


class UpdateComponents(BaseModel):
    code: Optional[str]
    action_id: Optional[UUID]
    dataclass: Optional[str]


class ConvertComponents(BaseModel):
    code: str
    action_id: str
    dataclass: Optional[str]
