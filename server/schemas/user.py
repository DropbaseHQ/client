from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class BaseUser(BaseModel):
    name: str
    email: str
    hashed_password: str
    trial_eligible: bool
    active: bool

    class Config:
        orm_mode = True


class CreateUser(BaseUser):
    name: str
    email: str
    hashed_password: str
    active: bool = False
    trial_eligible: bool = True
    confirmation_token: Optional[str]


class ReadUser(BaseModel):
    id: UUID
    name: str
    email: str
    active: Optional[bool]
    date: Optional[datetime]

    class Config:
        orm_mode = True


class UpdateUser(BaseModel):
    name: Optional[str]
    email: Optional[str]
    active: Optional[bool]


class LoginUser(BaseModel):
    email: str
    password: str


class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str


class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str
    reset_token: str


class AddPolicy(BaseModel):
    resource: str
    action: str


class AddPolicyRequest(BaseModel):
    workspace_id: str
    policies: list[AddPolicy]


class GetUserDetails(BaseModel):
    workspace_id: str


class UpdateUserPolicyRequest(BaseModel):
    resource: str
    action: str
    workspace_id: str


class ResendConfirmationEmailRequest(BaseModel):
    email: str


class RequestResetPassword(BaseModel):
    email: str
