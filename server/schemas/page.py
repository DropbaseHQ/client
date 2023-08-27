from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class BasePage(BaseModel):
    name: str
    app_id: UUID


class ReadPage(BasePage):
    id: UUID
    date: datetime


class CreatePage(BasePage):
    pass


class UpdatePage(BaseModel):
    name: Optional[str]
    app_id: Optional[UUID]
