from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.controllers.task import table
from server.utils.connect import get_db

router = APIRouter(prefix="/table", tags=["table"])


@router.get("/{app_id}")
def get_table(app_id: UUID, db: Session = Depends(get_db)):
    return table.get_table_data(db, app_id)
