from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class BaseComponents(BaseModel):
    code: str
    app_id: UUID


class ReadComponents(BaseComponents):
    id: UUID
    date: datetime


class CreateComponents(BaseComponents):
    pass


class UpdateComponents(BaseModel):
    code: Optional[str]
    app_id: Optional[UUID]
