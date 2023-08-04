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
    confirmation_token: Optional[str]
    customer_id: Optional[str]
    subscription_id: Optional[str]
    status: Optional[str]
    plan: Optional[str]

    class Config:
        orm_mode = True


class CreateUser(BaseUser):
    name: str
    email: str
    password: str


class ReadUser(BaseModel):
    id: UUID
    name: str
    email: str
    active: Optional[bool]
    date: Optional[datetime]
    customer_id: Optional[str]
    subscription_id: Optional[str]
    status: Optional[str]
    plan: Optional[str]


class UpdateUser(BaseModel):
    name: Optional[str]
    email: Optional[str]
    active: Optional[bool]
    date: Optional[datetime]
    customer_id: Optional[str]
    subscription_id: Optional[str]
    status: Optional[str]
    plan: Optional[str]
