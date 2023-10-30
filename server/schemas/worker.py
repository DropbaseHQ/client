from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class SyncColumnsRequest(BaseModel):
    app_name: str
    page_name: str
    table_columns: dict
    token: str


class SyncComponentsRequest(BaseModel):
    app_name: str
    page_name: str
    token: str
