from typing import Any, List
from uuid import UUID

from pydantic import BaseModel


class RunTask(BaseModel):
    app_id: UUID
    user_input: dict
    row: dict
    action: str


class CellEdit(BaseModel):
    schema: str
    table: str
    column: str
    value: Any
    new_value: Any


class EditCell(BaseModel):
    row: dict
    edits: List[CellEdit]
    sql_id: UUID
