from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Union
from uuid import UUID

from pydantic import BaseModel


# input
class InputDisplayProperties(BaseModel):
    message: Optional[str]
    message_type: Optional[str]


class InputSharedProperties(BaseModel):
    # editable
    options: Optional[str]
    visible: Optional[bool]
    value: Optional[str]


class InputStateProperties(InputDisplayProperties, InputSharedProperties):
    pass


# widget
class WidgetDisplayProperty(BaseModel):
    message: Optional[str]
    message_type: Optional[str]


class WidgetSharedProperty(BaseModel):
    pass


class WidgetStateProperty(WidgetDisplayProperty, WidgetSharedProperty):
    pass


# columns
class PgColumnDisplayProperty(BaseModel):
    message: Optional[str]
    message_type: Optional[str]


class PgColumnSharedProperty(BaseModel):
    editable: Optional[bool]
    visible: Optional[bool]


class PgColumnStateProperty(PgColumnDisplayProperty, PgColumnSharedProperty):
    pass


# table
class TableDisplayProperty(BaseModel):
    message: Optional[str]
    message_type: Optional[str]


class TableSharedProperty(BaseModel):
    pass


class TableStateProperty(TableDisplayProperty, TableSharedProperty):
    pass
