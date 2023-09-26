from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import UserRole
from server.schemas.role import CreateRole, UpdateRole


class CRUDRole(CRUDBase[UserRole, CreateRole, UpdateRole]):
    def user_is_in_workspace(self, db: Session, user_id: UUID, workspace_id: UUID) -> bool:
        return (
            db.query(UserRole)
            .filter(UserRole.user_id == user_id)
            .filter(UserRole.workspace_id == workspace_id)
            .count()
            > 0
        )


role = CRUDRole(UserRole)
