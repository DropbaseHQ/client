from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel


# text
class TextSharedProperties(BaseModel):
    # visible: Optional[bool]
    pass


class TextContextProperty(TextSharedProperties):
    pass


class TextBaseProperties(BaseModel):
    name: str
    text: Optional[str]
    size: Optional[Literal["small", "medium", "large"]]
    color: Optional[
        Literal[
            "red",
            "blue",
            "green",
            "yellow",
            "black",
            "white",
            "grey",
            "orange",
            "purple",
            "pink",
        ]
    ]
    display_rules: Optional[List[Dict]]


class TextDefinedProperty(TextBaseProperties, TextSharedProperties):
    pass
