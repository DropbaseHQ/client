from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.controllers.source import source
from server.schemas.source import CreateSourceRequest, UpdateSourceRequest
from server.utils.connect import get_db

router = APIRouter(prefix="/source", tags=["source"])


@router.post("/")
def run_task(request: CreateSourceRequest, db: Session = Depends(get_db)):
    user_email = ""
    return source.create_source(db, user_email, request)
