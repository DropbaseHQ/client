from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Functions
from server.schemas.functions import CreateFunctions, UpdateFunctions


class CRUDFunctions(CRUDBase[Functions, CreateFunctions, UpdateFunctions]):
    def get_app_functions(self, db: Session, app_id: UUID) -> List[Functions]:
        return db.query(Functions).filter(Functions.app_id == str(app_id)).order_by(Functions.date).all()


functions = CRUDFunctions(Functions)
