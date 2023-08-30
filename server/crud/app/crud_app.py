from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import App
from server.schemas.app import CreateApp, UpdateApp


class CRUDApp(CRUDBase[App, CreateApp, UpdateApp]):
    def get_workspace_apps(self, db: Session, workspace_id: UUID) -> List[App]:
        return db.query(App).filter(App.workspace_id == workspace_id).all()


app = CRUDApp(App)
