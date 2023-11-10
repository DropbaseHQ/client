from typing import Any, Callable, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field


class PinnedFilter(BaseModel):
    column_name: str
    # operator: Literal["and", "or", ""]
    condition: Literal["=", ">", "<", ">=", "<=", "like", "in"]


### table
class TableDisplayProperty(BaseModel):
    message: Optional[str]
    message_type: Optional[str]


class TableSharedProperty(BaseModel):
    pass


class TableContextProperty(TableDisplayProperty, TableSharedProperty):
    pass


class TableBaseProperty(BaseModel):
    name: str
    code: str
    filters: Optional[List[PinnedFilter]]
    type: Literal["python", "sql"]

    # on row change
    on_change: Optional[str]


class TableDefinedProperty(TableBaseProperty, TableSharedProperty):
    pass
