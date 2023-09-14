from typing import Any, Dict, List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel


class RunTask(BaseModel):
    page_id: UUID
    state: dict
    code: str
    test_code: str
    function_id: UUID


class CellProps(BaseModel):
    name: str
    schema_name: str
    table_name: str
    column_name: str
    edit_keys: List[str]


class CellEdit(BaseModel):
    column_name: str
    old_value: Any
    new_value: Any
    row: dict
    columns: Dict[str, CellProps]


class EditCell(BaseModel):
    edits: List[CellEdit]
    table_id: UUID


class RunCodeResponse(BaseModel):
    # is_state: bool
    is_state: Optional[bool]
    result: Optional[Any]
    state: Optional[dict]
    status: Literal["success", "error"]
    type: Literal["sql", "python"]
    stdout: Optional[str]
    traceback: Optional[str]
