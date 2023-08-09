from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Workspace, Role, User
from server.schemas.workspace import CreateWorkspace, UpdateWorkspace


class CRUDWorkspace(CRUDBase[Workspace, CreateWorkspace, UpdateWorkspace]):
    def get_workspace_owner(self, db: Session, workspace_id: UUID) -> User:
        return (
            db.query(User, Role.role)
            .join(Role, User.id == Role.user_id)
            .join(Workspace, Role.workspace_id == Workspace.id)
            .filter(Workspace.id == workspace_id, Role.role == "owner")
            .first()
        )


workspace = CRUDWorkspace(Workspace)
