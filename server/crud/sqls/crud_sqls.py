from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import SQLs
from server.schemas.sqls import CreateSQLs, UpdateSQLs


class CRUDSQLs(CRUDBase[SQLs, CreateSQLs, UpdateSQLs]):
    def get_page_sqls(self, db: Session, page_id: UUID) -> List[SQLs]:
        return db.query(SQLs).filter(SQLs.page_id == str(page_id)).all()

    def get_page_sql(self, db: Session, page_id: UUID) -> SQLs:
        return db.query(SQLs).filter(SQLs.page_id == str(page_id)).one()


sqls = CRUDSQLs(SQLs)
