from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class BaseGroup(BaseModel):
    name: str
    workspace_id: UUID


class ReadGroup(BaseGroup):
    pass


class CreateGroup(BaseGroup):
    pass


class UpdateGroup(BaseModel):
    name: Optional[str]
    workspace_id: Optional[UUID]


class AddUser(BaseModel):
    user_id: UUID


class RemoveUser(BaseModel):
    user_id: UUID
