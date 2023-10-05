from datetime import datetime
from enum import StrEnum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class FunctionType(StrEnum):
    PYTHON = "python"


class BaseFunctions(BaseModel):
    name: Optional[str]
    code: str
    test_code: Optional[str]
    page_id: UUID
    type: Optional[FunctionType]

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
