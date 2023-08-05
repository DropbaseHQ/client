from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import SQLs
from server.schemas.sqls import CreateSQLs, UpdateSQLs


class CRUDSQLs(CRUDBase[SQLs, CreateSQLs, UpdateSQLs]):
    pass


sqls = CRUDSQLs(SQLs)
