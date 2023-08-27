from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class BaseApp(BaseModel):
    name: str
    workspace_id: UUID


class ReadApp(BaseApp):
    id: UUID
    date: datetime


class CreateApp(BaseApp):
    pass


class UpdateApp(BaseModel):
    name: Optional[str]
