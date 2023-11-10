from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import App, Page, Tables, Token, Workspace
from server.schemas.tables import CreateTables, UpdateTables


class CRUDTables(CRUDBase[Tables, CreateTables, UpdateTables]):
    def get_page_tables(self, db: Session, page_id: UUID) -> List[Tables]:
        return (
            db.query(Tables)
            .filter(Tables.page_id == page_id)
            .order_by(Tables.date)
            .all()
        )

    def get_page_sql(self, db: Session, page_id: UUID) -> Tables:
        return db.query(Tables).filter(Tables.page_id == str(page_id)).one()

    def get_workspace_id(self, db: Session, tables_id: UUID) -> str:
        return (
            db.query(App.workspace_id)
            .join(Page, Page.app_id == App.id)
            .join(Tables, Tables.page_id == Page.id)
            .filter(Tables.id == tables_id)
            .one()
        ).workspace_id

    def get_app_id(self, db: Session, tables_id: UUID) -> str:
        return (
            db.query(Page.app_id)
            .join(Tables, Tables.page_id == Page.id)
            .filter(Tables.id == tables_id)
            .one()
        ).app_id

    def get_table_by_app_page_token(
        self, db: Session, table_name: str, page_name: str, app_name: str, token: str
    ) -> Tables:
        return (
            db.query(Tables)
            .join(Page, Page.id == Tables.page_id)
            .join(App, App.id == Page.app_id)
            .join(Workspace, Workspace.id == App.workspace_id)
            .join(Token, Workspace.id == Token.workspace_id)
            .filter(Page.name == page_name)
            .filter(App.name == app_name)
            .filter(Token.token == token)
            .filter(Tables.name == table_name)
            .first()
        )

    def get_page_app_names_from_table(self, db: Session, table_id: UUID):
        return (
            db.query(Page.name, App.name)
            .join(Tables, Page.id == Tables.page_id)
            .join(App, App.id == Page.app_id)
            .filter(Tables.id == table_id)
            .first()
        )


tables = CRUDTables(Tables)
