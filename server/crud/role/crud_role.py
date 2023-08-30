from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Role
from server.schemas.role import CreateRole, UpdateRole


class CRUDRole(CRUDBase[Role, CreateRole, UpdateRole]):
    def user_is_in_workspace(self, db: Session, user_id: UUID, workspace_id: UUID) -> bool:
        return (
            db.query(Role)
            .filter(Role.user_id == str(user_id))
            .filter(Role.workspace_id == str(workspace_id))
            .count()
            > 0
        )


role = CRUDRole(Role)
