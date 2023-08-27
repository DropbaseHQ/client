from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class BaseAction(BaseModel):
    name: str
    page_id: UUID
    settings: Optional[dict]
    dataclass: Optional[str]


class ReadAction(BaseAction):
    id: UUID
    date: datetime


class CreateAction(BaseAction):
    pass


class UpdateAction(BaseModel):
    name: Optional[str]
    page_id: Optional[UUID]
    settings: Optional[dict]
    dataclass: Optional[str]
