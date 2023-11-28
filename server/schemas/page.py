from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field

from server.constants import FILE_NAME_REGEX


class BasePage(BaseModel):
    name: str = Field(regex=FILE_NAME_REGEX)
    app_id: UUID

    class Config:
        orm_mode = True


class ReadPage(BasePage):
    id: UUID
    date: datetime


class CreatePage(BasePage):
    pass


class UpdatePage(BaseModel):
    name: Optional[str]
    app_id: Optional[UUID]
