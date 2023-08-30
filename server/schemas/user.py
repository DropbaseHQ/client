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


class ReadUser(BaseModel):
    id: UUID
    name: str
    email: str
    active: Optional[bool]
    date: Optional[datetime]


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
    # reset_token: str
