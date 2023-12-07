from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import App, Columns, Page, Tables
from server.schemas.columns import CreateColumns, UpdateColumns


class CRUDColumns(CRUDBase[Columns, CreateColumns, UpdateColumns]):
    def get_table_columns(self, db: Session, table_id: UUID) -> List[Columns]:
        return db.query(Columns).filter(Columns.table_id == table_id).all()

    def get_resources(self, db: Session, table_id: UUID) -> List[Columns]:
        return db.query(Columns).filter(Columns.table_id == table_id).all()

    def get_workspace_id(self, db: Session, columns_id: UUID) -> str:
        return (
            db.query(App.workspace_id)
            .join(Page, Page.app_id == App.id)
            .join(Tables, Tables.page_id == Page.id)
            .join(Columns, Columns.table_id == Tables.id)
            .filter(Columns.id == columns_id)
            .one()
        ).workspace_id

    def get_app_id(self, db: Session, columns_id: UUID) -> str:
        return (
            db.query(Page.app_id)
            .join(Tables, Tables.page_id == Page.id)
            .join(Columns, Columns.table_id == Tables.id)
            .filter(Columns.id == columns_id)
            .one()
        ).app_id

    def delete_table_columns(self, db: Session, table_id: UUID):
        db.query(Columns).filter(Columns.table_id == table_id).delete()
        db.commit()


columns = CRUDColumns(Columns)
