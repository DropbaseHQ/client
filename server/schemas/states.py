from typing import Any, List, Optional

from pydantic import BaseModel


# input
class ComponentDisplayProperties(BaseModel):
    message: Optional[str]
    message_type: Optional[str]


class InputSharedProperties(BaseModel):
    visible: Optional[bool]
    value: Optional[str]


class SelectSharedProperties(BaseModel):
    visible: Optional[bool]
    value: Optional[str]
    options: Optional[List[str:Any]]  # FIXME: {name : value, ...}


class ButtonSharedProperties(BaseModel):
    visible: Optional[bool]


class TextSharedProperties(BaseModel):
    visible: Optional[bool]


class InputStateProperties(ComponentDisplayProperties, InputSharedProperties):
    pass


class SelectStateProperties(ComponentDisplayProperties, SelectSharedProperties):
    pass


class ButtonStateProperties(ComponentDisplayProperties, ButtonSharedProperties):
    pass


class TextStateProperties(TextSharedProperties):
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
