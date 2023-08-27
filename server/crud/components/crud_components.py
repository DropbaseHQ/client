from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Components
from server.schemas.components import CreateComponents, UpdateComponents


class CRUDComponents(CRUDBase[Components, CreateComponents, UpdateComponents]):
    def get_action_component(self, db: Session, action_id: UUID) -> Components:
        return db.query(Components).filter(Components.action_id == str(action_id)).one()


components = CRUDComponents(Components)
