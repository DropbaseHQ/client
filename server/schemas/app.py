from pydantic import BaseModel


class CreateAppRequest(BaseModel):
    name: str
    label: str
    id: str
    workspace_id: str
