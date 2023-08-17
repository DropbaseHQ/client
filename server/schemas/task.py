from typing import Any, List
from uuid import UUID

from pydantic import BaseModel


class RunTask(BaseModel):
    app_id: UUID
    user_input: dict
    row: dict
    action: str


class CellEdit(BaseModel):
    schema_name: str
    table_name: str
    column_name: str
    value: Any
    new_value: Any
    key_column_name: str
    key_column_value: Any


class EditCell(BaseModel):
    # row: dict
    edits: List[CellEdit]
    sql_id: UUID
