from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class BaseUser(BaseModel):
    name: str
    email: str
    hashed_password: str
    trial_eligible: bool
    active: bool

    model_config = ConfigDict(from_attributes=True)


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
