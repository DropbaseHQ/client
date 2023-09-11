from typing import Any, List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel


class RunTask(BaseModel):
    page_id: UUID
    # user_input: dict
    # row: dict
    state: dict
    action: str
    # call_type: Literal["task", "function"] = "task"


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


class RunCodeResponse(BaseModel):
    status: Literal["success", "error"]
    type: Literal["sql", "python"]
    stdout: Optional[str]
    result: Optional[Any]
    traceback: Optional[str]
