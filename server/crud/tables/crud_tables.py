from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import App, Page, Tables
from server.schemas.tables import CreateTables, UpdateTables


class CRUDTables(CRUDBase[Tables, CreateTables, UpdateTables]):
    def get_page_tables(self, db: Session, page_id: UUID) -> List[Tables]:
        return db.query(Tables).filter(Tables.page_id == page_id).all()

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


tables = CRUDTables(Tables)
