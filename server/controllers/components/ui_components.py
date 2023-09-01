from typing import Any, Callable, Dict, List, Optional

from pydantic import BaseModel


class Input(BaseModel):
    # read_only
    # ui
    name: Optional[str]
    type: Optional[str]
    label: Optional[str]
    # ui logic
    required: Optional[bool]
    validation: Optional[str]
    # ui options
    default: Optional[str]
    placeholder: Optional[str]
    # ui events
    rules: Optional[List[Dict]]
    display_rules: Optional[List[Dict]]
    on_change_rules: Optional[List[Dict]]

    on_select: Optional[Callable[[int], int]]
    on_click: Optional[Callable[[int], int]]
    on_change: Optional[Callable[[int], int]]

    # editable
    options: Optional[Any]
    visible: Optional[bool]
    value: Optional[Any]
