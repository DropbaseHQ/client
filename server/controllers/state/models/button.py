from typing import Optional, List, Dict

from pydantic import BaseModel

from .common import ComponentDisplayProperties


# button
class ButtonSharedProperties(BaseModel):
    visible: Optional[bool]


class ButtonContextProperty(ComponentDisplayProperties, ButtonSharedProperties):
    pass


class ButtonBaseProperties(BaseModel):
    name: str
    label: Optional[str]
    # editable
    visible: Optional[bool]
    # server call
    on_click: Optional[str]
    # = Field(..., description="function", Optional=True)
    display_rules: Optional[List[Dict]]


class ButtonDefinedProperty(ButtonBaseProperties, ButtonSharedProperties):
    pass
