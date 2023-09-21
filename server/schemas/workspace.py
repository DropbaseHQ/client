from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class BaseWorkspace(BaseModel):
    name: str
    active: bool = True

    class Config:
        orm_mode = True


class ReadWorkspace(BaseWorkspace):
    id: UUID
    date: datetime


class CreateWorkspace(BaseWorkspace):
    pass


class UpdateWorkspace(BaseModel):
    name: Optional[str]
    active: Optional[bool]
