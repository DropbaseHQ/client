from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import App, Components, Page, Widget
from server.schemas.components import CreateComponents, UpdateComponents


class CRUDComponents(CRUDBase[Components, CreateComponents, UpdateComponents]):
    def get_widget_component(self, db: Session, widget_id: UUID) -> Components:
        return db.query(Components).filter(Components.widget_id == str(widget_id)).one()

    def get_workspace_id(self, db: Session, components_id: UUID) -> str:
        return (
            db.query(App.workspace_id)
            .join(Page, Page.app_id == App.id)
            .join(Widget, Widget.page_id == Page.id)
            .join(Components, Components.widget_id == Widget.id)
            .filter(Components.id == str(components_id))
            .one()
        ).workspace_id


components = CRUDComponents(Components)
