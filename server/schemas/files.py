from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class BaseFiles(BaseModel):
    name: str
    type: str
    source: Optional[str]
    page_id: UUID

    class Config:
        orm_mode = True


class ReadFiles(BaseFiles):
    id: UUID
    date: datetime


class CreateFiles(BaseFiles):
    pass


class UpdateFiles(BaseModel):
    name: Optional[str]
    source: Optional[str]


class UpdateFilesRequest(UpdateFiles):
    file_id: Optional[UUID]
    depends_on: Optional[List]


class RenameFile(BaseModel):
    old_name: str
    new_name: str
    page_id: UUID
