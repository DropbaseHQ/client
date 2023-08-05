from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class BaseSQLs(BaseModel):
    code: str
    app_id: UUID


class ReadSQLs(BaseSQLs):
    id: UUID
    date: datetime


class CreateSQLs(BaseSQLs):
    pass


class UpdateSQLs(BaseModel):
    code: Optional[str]
    app_id: Optional[UUID]
