from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.controllers.task import table
from server.utils.connect import get_db

router = APIRouter(prefix="/table", tags=["table"])


@router.get("/{table_id}")
def get_table(table_id: UUID, db: Session = Depends(get_db)):
    return table.get_table_data(db, table_id)
