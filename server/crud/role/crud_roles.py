from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Role, Policy
from server.schemas.role import CreateRole, UpdateRole


class CRUDRole(CRUDBase[Role, CreateRole, UpdateRole]):
    def get_role_policies(self, db: Session, role_id: UUID):
        return db.query(Policy).join(Role, Role.id == Policy.role_id).filter(Role.id == role_id).all()


role = CRUDRole(Role)
