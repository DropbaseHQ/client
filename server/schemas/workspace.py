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


class AddUserRequest(BaseModel):
    user_email: str
    role_id: UUID


class RemoveUserRequest(BaseModel):
    user_id: UUID


class UpdateUserRoleRequest(BaseModel):
    user_id: UUID
    role_id: UUID


class UpdateWorkspaceToken(BaseModel):
    token: Optional[str]
    token_id: Optional[UUID]
