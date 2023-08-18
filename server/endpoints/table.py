from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.controllers.task import table
from server.schemas.sqls import QueryTable
from server.utils.connect import get_db

router = APIRouter(prefix="/table", tags=["table"])


@router.post("/")
def get_table(request: QueryTable, db: Session = Depends(get_db)):
    return table.get_table_data(db, request)
