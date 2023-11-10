from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel


## components
# input
class ComponentDisplayProperties(BaseModel):
    message: Optional[str]
    message_type: Optional[str]
