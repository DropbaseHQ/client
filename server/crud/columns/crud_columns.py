from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import App, Columns, Page, SQLs, Widget
from server.schemas.columns import CreateColumns, UpdateColumns


class CRUDColumns(CRUDBase[Columns, CreateColumns, UpdateColumns]):
    def get_sql_columns(self, db: Session, sql_id: UUID) -> List[Columns]:
        db.query(Columns).filter(Columns.sql_id == sql_id).all()


columns = CRUDColumns(Columns)
