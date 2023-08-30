from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class BaseFunctions(BaseModel):
    code: str
    page_id: UUID
    type: str


class ReadFunctions(BaseFunctions):
    id: UUID
    date: datetime


class CreateFunctions(BaseFunctions):
    pass


class UpdateFunctions(BaseModel):
    code: Optional[str]
    page_id: Optional[UUID]
    type: Optional[str]
