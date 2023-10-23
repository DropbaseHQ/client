from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import App, Page, Tables
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

    def get_app_id(self, db: Session, page_id: UUID) -> str:
        return (db.query(Page.app_id).filter(Page.id == str(page_id)).one()).app_id

    def get_table_page(self, db: Session, table_id: UUID) -> Page:
        return db.query(Page).join(Tables, Tables.page_id == Page.id).first()


page = CRUDPage(Page)
