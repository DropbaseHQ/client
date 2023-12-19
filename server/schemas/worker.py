from typing import List, Optional

from pydantic import BaseModel


class SyncColumnsRequest(BaseModel):
    class Column(BaseModel):
        name: str
        type: Optional[str]
    table_id: str
    columns: List[Column]
    type: str


class SyncComponentsRequest(BaseModel):
    app_name: str
    page_name: str
    token: str
