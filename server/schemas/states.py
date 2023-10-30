from typing import Annotated, Dict, List, Optional

from pydantic import BaseModel

from server.schemas.properties import PropertyCategory


# input
class ComponentDisplayProperties(BaseModel):
    message: Optional[str]
    message_type: Optional[str]


class InputSharedProperties(BaseModel):
    visible: Optional[bool]
    value: Optional[str]


class InputStateProperties(ComponentDisplayProperties, InputSharedProperties):
    pass


class SelectSharedProperties(BaseModel):
    visible: Optional[bool]
    value: Optional[str]
    options: Annotated[Optional[List[Dict]], PropertyCategory.default]  # {name : value, ...}


class SelectStateProperties(ComponentDisplayProperties, SelectSharedProperties):
    pass


class ButtonSharedProperties(BaseModel):
    visible: Optional[bool]


class ButtonStateProperties(ComponentDisplayProperties, ButtonSharedProperties):
    pass


class TextSharedProperties(BaseModel):
    visible: Optional[bool]


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
class ColumnDisplayProperty(BaseModel):
    message: Optional[str]
    message_type: Optional[str]


class ColumnSharedProperty(BaseModel):
    editable: Optional[bool] = False
    visible: Optional[bool] = True


class ColumnStateProperty(ColumnDisplayProperty, ColumnSharedProperty):
    pass


# table
class TableDisplayProperty(BaseModel):
    message: Optional[str]
    message_type: Optional[str]


class TableSharedProperty(BaseModel):
    pass


class TableStateProperty(TableDisplayProperty, TableSharedProperty):
    pass
