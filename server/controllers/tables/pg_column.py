from typing import Optional

from pydantic import BaseModel


class PgSmartColumnProperty(BaseModel):

    name: str
    type: Optional[str]

    schema_name: str = None
    table_name: str = None
    column_name: str = None

    primary_key: bool = False
    foreign_key: bool = False
    default: str = None
    nullable: bool = True
    unique: bool = False

    edit_keys: list = []

    visible: bool = True
    editable: bool = False
