from typing import Any

from pydantic import BaseModel


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
    hidden: bool = False

    class Config:
        orm_mode = True
