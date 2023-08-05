from typing import Any, List, Optional, Union
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy.orm import Session

from server import crud


class RunTask(BaseModel):
    user_input: dict
    row: dict
    action: str


def run_task(request: RunTask, db: Session):
    # get table schema for row
    # get user input schema from ui components
    # row and user input could be saved in sqlite
    pass


def run_function(exec_code: str, function_name: str):
    # user_code = """result = get_plans(row, user_input, local_data)"""
    ldic = globals()
    exec(exec_code, ldic)
    return ldic["result"]
