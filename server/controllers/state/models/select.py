from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel

from .common import ComponentDisplayProperties


# select
class SelectSharedProperties(BaseModel):
    visible: Optional[bool]
    value: Optional[str]
    options: Optional[List[Dict]]  # {name : value, ...}


class SelectContextProperty(ComponentDisplayProperties, SelectSharedProperties):
    pass


class SelectBaseProperties(BaseModel):
    name: str
    # multi: bool
    label: Optional[str]
    # ui logic
    required: Optional[bool]
    validation: Optional[str]
    # ui options
    default: Optional[Any]
    # ui events
    rules: Optional[List[Dict]]
    # server calls
    on_change: Optional[str]


class SelectDefinedProperty(SelectBaseProperties, SelectSharedProperties):
    pass
