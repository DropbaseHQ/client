from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Action, Workspace, Page, App
from server.schemas.action import CreateAction, UpdateAction


class CRUDAction(CRUDBase[Action, CreateAction, UpdateAction]):
    def get_page_action(self, db: Session, page_id: UUID) -> Action:
        return db.query(Action).filter(Action.page_id == str(page_id)).one_or_none()

    def get_workspace_id(self, db: Session, action_id: UUID) -> Workspace:
        return (
            db.query(App.workspace_id)
            .join(Page, Page.id == Action.page_id)
            .join(Action, Action.page_id == Page.id)
            .filter(Action.id == str(action_id))
            .one()
        ).workspace_id


action = CRUDAction(Action)
