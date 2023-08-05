from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Workspace
from server.schemas.workspace import CreateWorkspace, UpdateWorkspace


class CRUDWorkspace(CRUDBase[Workspace, CreateWorkspace, UpdateWorkspace]):
    pass


workspace = CRUDWorkspace(Workspace)
