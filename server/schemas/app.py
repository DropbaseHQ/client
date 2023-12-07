from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field

from server.constants import FILE_NAME_REGEX


class BaseApp(BaseModel):
    name: str = Field(regex=FILE_NAME_REGEX)
    workspace_id: Optional[UUID] = None

    class Config:
        orm_mode = True


class ReadApp(BaseApp):
    id: UUID
    date: datetime


class CreateApp(BaseApp):
    workspace_id: UUID


class UpdateApp(BaseModel):
    name: Optional[str]


class Function(BaseModel):
    name: str
    source: str


class FinalizeApp(BaseModel):
    name: Optional[str]
    is_draft: Optional[bool]


class RenameApp(BaseModel):
    app_id: str
    old_name: str
    new_name: str
