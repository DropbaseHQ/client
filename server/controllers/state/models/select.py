from typing import Annotated, Any, Dict, List, Optional

from pydantic import BaseModel

from server.schemas.properties import PropertyCategory

from .common import ComponentDisplayProperties


# select
class SelectSharedProperties(BaseModel):
    # visible: Optional[bool]
    value: Optional[str]
    options: Annotated[Optional[List[Dict]], PropertyCategory.default]


class SelectContextProperty(ComponentDisplayProperties, SelectSharedProperties):
    pass


class SelectBaseProperties(BaseModel):
    name: str
    # multi: bool
    label: Optional[str]
    # ui logic
    required: Optional[bool]
    validation_rules: Optional[List[Dict]]
    # ui options
    default: Optional[Any]
    # ui events
    display_rules: Optional[List[Dict]]
    # server calls
    on_change: Optional[str]

    @property
    def state(self):
        # TODO: match based on value type
        return str


class SelectDefinedProperty(SelectBaseProperties, SelectSharedProperties):
    pass
