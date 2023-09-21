from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Role, Workspace
from server.schemas.workspace import CreateWorkspace, UpdateWorkspace


class CRUDWorkspace(CRUDBase[Workspace, CreateWorkspace, UpdateWorkspace]):
    def get_user_workspaces(self, db: Session, user_id: UUID) -> List[Workspace]:
        return (
            db.query(Workspace)
            .join(Role, Role.workspace_id == Workspace.id)
            .filter(Role.user_id == user_id)
            .all()
        )


workspace = CRUDWorkspace(Workspace)
