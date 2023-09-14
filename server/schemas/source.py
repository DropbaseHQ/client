from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel


class BaseSource(BaseModel):
    name: str
    description: Optional[str]
    type: str
    creds: str
    workspace_id: UUID


class ReadSource(BaseSource):
    id: UUID
    date: datetime


class CreateSource(BaseSource):
    pass


class BaseDatabaseCredentials(BaseModel):
    host: str
    port: int
    username: str
    database: str


class CreateDatabaseCredentials(BaseDatabaseCredentials):
    password: str


class BaseSnowflakeCredentials(BaseModel):
    account: str
    database: str
    username: str
    warehouse: Optional[str]
    role: Optional[str]
    sf_schema: Optional[str]


class CreateSnowflakeCredentials(BaseSnowflakeCredentials):
    password: str


class CreateBigQueryCredentials(BaseModel):
    creds_json: str


class CreateSourceRequest(BaseModel):
    name: str
    description: Optional[str]
    type: str
    creds: Union[CreateDatabaseCredentials, CreateSnowflakeCredentials, CreateBigQueryCredentials]


class UpdateSource(BaseModel):
    id: Optional[UUID]
    name: Optional[str]
    description: Optional[str]
    type: Optional[str]
    creds: Optional[str]
    workspace_id: Optional[UUID]


class UpdateSourceRequest(BaseModel):
    name: Optional[str]
    description: Optional[str]
    type: Optional[str]
    creds: Optional[dict]
    workspace_id: Optional[UUID]
    source_id: Optional[UUID]


class ReadSourceResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    type: str
    creds: Union[BaseDatabaseCredentials, BaseSnowflakeCredentials, CreateBigQueryCredentials]
