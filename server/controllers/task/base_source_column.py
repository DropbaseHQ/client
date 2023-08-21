from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


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
    key_column: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    # from_attributes = True
    # orm_mode = True
