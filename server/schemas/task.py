from uuid import UUID

from pydantic import BaseModel


class RunTask(BaseModel):
    app_id: UUID
    user_input: dict
    row: dict
    action: str
