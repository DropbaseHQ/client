from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import SQLs
from server.schemas.sqls import CreateSQLs, UpdateSQLs


class CRUDSQLs(CRUDBase[SQLs, CreateSQLs, UpdateSQLs]):
    def get_app_sqls(self, db: Session, app_id: UUID) -> List[SQLs]:
        return db.query(SQLs).filter(SQLs.app_id == str(app_id)).all()

    def get_app_sql(self, db: Session, app_id: UUID) -> SQLs:
        return db.query(SQLs).filter(SQLs.app_id == str(app_id)).one()


sqls = CRUDSQLs(SQLs)
