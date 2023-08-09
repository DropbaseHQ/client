from typing import Any

from pydantic import BaseModel


# @dataclass
class SourceColumn(BaseModel):

    name: str
    type: str
    primary_key: bool = False
    foreign_key: bool = False
    default: Any = None
    nullable: bool = True
    unique: bool = False
    create_required: bool = False
    modify_required: bool = False
    keylike: bool = False

    # table display specific
    editable: bool = False
    visible: bool = True

    class Config:
        orm_mode = True
