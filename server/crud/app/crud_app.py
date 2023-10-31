from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import App, Page
from server.schemas.app import CreateApp, UpdateApp


class CRUDApp(CRUDBase[App, CreateApp, UpdateApp]):
    def get_workspace_apps(self, db: Session, workspace_id: UUID) -> List[App]:
        return db.query(App).filter(App.workspace_id == workspace_id).all()

    def get_app_by_page_id(self, db: Session, page_id: UUID) -> Optional[App]:
        return db.query(App).join(Page, App.id == Page.app_id).filter(Page.id == page_id).first()


app = CRUDApp(App)
