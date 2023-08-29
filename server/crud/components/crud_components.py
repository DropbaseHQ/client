from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Components, Action, Workspace, Page, App
from server.schemas.components import CreateComponents, UpdateComponents


class CRUDComponents(CRUDBase[Components, CreateComponents, UpdateComponents]):
    def get_action_component(self, db: Session, action_id: UUID) -> Components:
        return db.query(Components).filter(Components.action_id == str(action_id)).one()

    def get_workspace_id(self, db: Session, components_id: UUID) -> str:
        return (
            db.query(App.workspace_id)
            .join(Page, Page.id == Action.page_id)
            .join(Action, Action.page_id == Page.id)
            .join(Components, Components.action_id == Action.id)
            .filter(Action.id == str(components_id))
            .one()
        ).workspace_id


components = CRUDComponents(Components)
