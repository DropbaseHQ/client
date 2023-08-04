from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Source
from server.schemas.source import CreateSource, UpdateSource


class CRUDSource(CRUDBase[Source, CreateSource, UpdateSource]):
    def get_user_destinations(self, db: Session, user_id: UUID) -> List[Source]:
        return db.query(Source).filter(Source.user_id == str(user_id)).all()


source = CRUDSource(Source)
