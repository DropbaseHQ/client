from typing import List, Optional

from pydantic import BaseModel


class ColumnSyncData(BaseModel):
    name: str
    type: Optional[str]


class SyncColumnsRequest(BaseModel):
    table_id: str
    columns: List[ColumnSyncData]
    type: str


class SyncComponentsRequest(BaseModel):
    app_name: str
    page_name: str
    token: str
