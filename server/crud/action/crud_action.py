from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Action
from server.schemas.action import CreateAction, UpdateAction


class CRUDAction(CRUDBase[Action, CreateAction, UpdateAction]):
    def get_page_action(self, db: Session, page_id: UUID) -> Action:
        return db.query(Action).filter(Action.page_id == str(page_id)).one()


action = CRUDAction(Action)
