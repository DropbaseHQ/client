from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Columns
from server.schemas.columns import CreateColumns, UpdateColumns


class CRUDColumns(CRUDBase[Columns, CreateColumns, UpdateColumns]):
    def get_table_columns(self, db: Session, table_id: UUID) -> List[Columns]:
        return db.query(Columns).filter(Columns.table_id == table_id).all()


columns = CRUDColumns(Columns)
