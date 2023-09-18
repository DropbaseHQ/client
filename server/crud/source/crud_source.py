from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Source
from server.schemas.source import CreateSource, UpdateSource


class CRUDSource(CRUDBase[Source, CreateSource, UpdateSource]):
    def get_workspace_sources(self, db: Session, workspace_id: UUID) -> List[Source]:
        return (
            db.query(Source.id, Source.name, Source.description, Source.type)
            .filter(Source.workspace_id == workspace_id)
            .all()
        )


source = CRUDSource(Source)
