from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Page, Action, Page, App
from server.schemas.page import CreatePage, UpdatePage


class CRUDPage(CRUDBase[Page, CreatePage, UpdatePage]):
    def get_workspace_id(self, db: Session, page_id: UUID) -> str:
        return (
            db.query(App.workspace_id)
            .join(Page, Page.app_id == App.id)
            .filter(Page.id == str(page_id))
            .one()
        ).workspace_id

    def get_app_pages(self, db: Session, app_id: UUID) -> List[Page]:
        return db.query(Page).filter(Page.app_id == app_id).all()


page = CRUDPage(Page)
