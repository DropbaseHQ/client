from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import UserRole, Workspace, Policy
from server.schemas.workspace import CreateWorkspace, UpdateWorkspace


class CRUDWorkspace(CRUDBase[Workspace, CreateWorkspace, UpdateWorkspace]):
    def get_user_workspaces(self, db: Session, user_id: UUID) -> List[Workspace]:
        return (
            db.query(Workspace)
            .join(UserRole, UserRole.workspace_id == Workspace.id)
            .filter(UserRole.user_id == user_id)
            .all()
        )

    def get_workspace_id(self, db: Session, workspace_id: UUID) -> str:
        return (db.query(Workspace.id).filter(Workspace.id == workspace_id).one()).id

    def get_workspace_policies(self, db: Session, workspace_id: UUID):
        return (
            db.query(Policy)
            .filter(Policy.workspace_id == workspace_id)
            .filter(Policy.ptype.startswith("p"))
            .all()
        )

    def get_workspace_grouping_policies(self, db: Session, workspace_id: UUID):
        return (
            db.query(Policy)
            .filter(Policy.workspace_id == workspace_id)
            .filter(Policy.ptype.startswith("g"))
            .all()
        )


workspace = CRUDWorkspace(Workspace)
