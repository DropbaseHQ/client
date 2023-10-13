from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import App, Components, Page, Widget
from server.schemas.components import CreateComponents, UpdateComponents


class CRUDComponents(CRUDBase[Components, CreateComponents, UpdateComponents]):
    def get_widget_component(self, db: Session, widget_id: UUID) -> List[Components]:
        return db.query(Components).filter(Components.widget_id == widget_id).all()

    def get_workspace_id(self, db: Session, components_id: UUID) -> str:
        return (
            db.query(App.workspace_id)
            .join(Page, Page.app_id == App.id)
            .join(Widget, Widget.page_id == Page.id)
            .join(Components, Components.widget_id == Widget.id)
            .filter(Components.id == components_id)
            .one()
        ).workspace_id

    def get_component_by_after(self, db: Session, widget_id: UUID, after: UUID) -> Components:
        return (
            db.query(Components)
            .filter(Components.after == after)
            .filter(Components.widget_id == widget_id)
            .first()
        )

    def get_app_id(self, db: Session, components_id: UUID) -> str:
        return (
            db.query(Page.app_id)
            .join(Widget, Widget.page_id == Page.id)
            .join(Components, Components.widget_id == Widget.id)
            .filter(Components.id == components_id)
            .one()
        ).app_id


components = CRUDComponents(Components)
