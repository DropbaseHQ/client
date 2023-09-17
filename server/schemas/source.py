from datetime import datetime
from enum import StrEnum
from typing import Optional, Union
from uuid import UUID

from pydantic import BaseModel


class SourceType(StrEnum):
    POSTGRES = "postgres"


class BaseSource(BaseModel):
    name: str
    description: Optional[str]
    type: SourceType
    creds: str
    workspace_id: UUID


class ReadSource(BaseSource):
    id: UUID
    date: datetime


class CreateSource(BaseSource):
    pass


class BaseDatabaseCredentials(BaseModel):
    host: str
    port: int = 5432
    username: str
    database: str


class DatabaseCredentials(BaseDatabaseCredentials):
    password: str


class CreateSourceRequest(BaseModel):
    name: str
    workspace_id: UUID
    description: Optional[str]
    type: SourceType
    creds: DatabaseCredentials


class UpdateSource(BaseModel):
    id: Optional[UUID]
    name: Optional[str]
    description: Optional[str]
    type: Optional[SourceType]
    creds: Optional[str]
    workspace_id: Optional[UUID]


class UpdateSourceRequest(BaseModel):
    name: Optional[str]
    description: Optional[str]
    type: Optional[SourceType]
    creds: Optional[dict]
    workspace_id: Optional[UUID]
    source_id: Optional[UUID]


class ReadSourceResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    type: SourceType
    creds: BaseDatabaseCredentials
