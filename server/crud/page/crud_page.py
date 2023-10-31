from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import App, Page, Tables, Token, Workspace
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

    def get_first_app_page(self, db: Session, app_id: UUID) -> Page:
        return db.query(Page).filter(Page.app_id == app_id).first()

    def get_app_id(self, db: Session, page_id: UUID) -> str:
        return (db.query(Page.app_id).filter(Page.id == str(page_id)).one()).app_id

    def get_table_page(self, db: Session, table_id: UUID) -> Page:
        return (
            db.query(Page).join(Tables, Tables.page_id == Page.id).filter(Tables.id == table_id).first()
        )

    def get_page_by_app_page_token(self, db: Session, page_name: str, app_name: str, token: str) -> Page:
        return (
            db.query(Page)
            .join(App, App.id == Page.app_id)
            .join(Workspace, Workspace.id == App.workspace_id)
            .join(Token, Workspace.id == Token.workspace_id)
            .filter(Page.name == page_name)
            .filter(App.name == app_name)
            .filter(Token.token == token)
            .first()
        )


page = CRUDPage(Page)
