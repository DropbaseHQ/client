from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel


# text
class TextSharedProperties(BaseModel):
    visible: Optional[bool]


class TextContextProperty(TextSharedProperties):
    pass


class TextBaseProperties(BaseModel):
    name: str
    text: Optional[str]
    size: Optional[Literal["small", "medium", "large"]]
    color: Optional[
        Literal["red", "blue", "green", "yellow", "black", "white", "grey", "orange", "purple", "pink"]
    ]


class TextDefinedProperty(TextBaseProperties, TextSharedProperties):
    pass
