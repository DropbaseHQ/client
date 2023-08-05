from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class BaseFunctions(BaseModel):
    code: str
    app_id: UUID


class ReadFunctions(BaseFunctions):
    id: UUID
    date: datetime


class CreateFunctions(BaseFunctions):
    pass


class UpdateFunctions(BaseModel):
    code: Optional[str]
    app_id: Optional[UUID]
