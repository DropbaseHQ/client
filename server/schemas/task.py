from typing import Any, List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel


class RunTask(BaseModel):
    page_id: UUID
    state: dict
    code: str
    test_code: str
    function_id: UUID


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
    # is_state: bool
    result: Optional[Any]
    state: Optional[dict]
    status: Literal["success", "error"]
    type: Literal["sql", "python"]
    stdout: Optional[str]
    traceback: Optional[str]
