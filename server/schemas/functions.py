from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class BaseFunctions(BaseModel):
    name: Optional[str]
    code: str
    test_code: Optional[str]
    page_id: UUID
    type: Optional[str]

    class Config:
        orm_mode = True


class ReadFunctions(BaseFunctions):
    id: UUID
    date: datetime


class CreateFunctions(BaseFunctions):
    pass


class UpdateFunctions(BaseModel):
    name: Optional[str]
    code: Optional[str]
    test_code: Optional[str]
