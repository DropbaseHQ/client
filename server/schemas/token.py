from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class BaseToken(BaseModel):
    token: str
    user_id: UUID
    workspace_id: UUID
    comment: Optional[str]


class ReadToken(BaseToken):
    id: UUID
    date: datetime


class CreateToken(BaseToken):
    pass


class UpdateToken(BaseModel):
    # NOTE: this should not be used. you can only create and delete tokens
    token: str