from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class BaseDataFetcher(BaseModel):
    file_name: str
    type: str
    source: Optional[str]
    page_id: UUID

    class Config:
        orm_mode = True


class ReadDataFetcher(BaseDataFetcher):
    id: UUID
    date: datetime


class CreateDataFetcher(BaseDataFetcher):
    pass


class UpdateDataFetcher(BaseDataFetcher):
    file_name: str
    type: str
    source: Optional[str]
    page_id: UUID


class RenameFile(BaseModel):
    old_file_name: str
    new_file_name: str
    page_id: UUID
