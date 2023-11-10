from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import App, Page, Widget, Workspace
from server.schemas.widget import CreateWidget, UpdateWidget


class CRUDWidget(CRUDBase[Widget, CreateWidget, UpdateWidget]):
    def get_page_widget(self, db: Session, page_id: UUID) -> Widget:
        return db.query(Widget).filter(Widget.page_id == str(page_id)).first()

    def get_page_widgets(self, db: Session, page_id: UUID) -> List[Widget]:
        return db.query(Widget).filter(Widget.page_id == str(page_id)).all()

    def get_workspace_id(self, db: Session, widget_id: UUID) -> Workspace:
        return (
            db.query(App.workspace_id)
            .join(Page, Page.app_id == App.id)
            .join(Widget, Widget.page_id == Page.id)
            .filter(Widget.id == widget_id)
            .one()
        ).workspace_id

    def get_app_id(self, db: Session, widget_id: UUID) -> App:
        return (
            db.query(Page.app_id)
            .join(Widget, Widget.page_id == Page.id)
            .filter(Widget.id == widget_id)
            .one()
        ).app_id


widget = CRUDWidget(Widget)
