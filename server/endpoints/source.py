from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.controllers.source import source
from server.schemas.source import CreateSourceRequest, UpdateSourceRequest
from server.utils.connect import get_db
from server.utils.authorization import generate_resource_dependency

authorize_source_actions = generate_resource_dependency("source")
router = APIRouter(prefix="/source", tags=["source"], dependencies=[Depends(authorize_source_actions)])


@router.get("/{source_id}")
def get_source(source_id: UUID, db: Session = Depends(get_db)):
    return source.get_source(db, source_id)


@router.post("/")
def create_source(request: CreateSourceRequest, db: Session = Depends(get_db)):
    user_email = ""
    return source.create_source(db, user_email, request)


@router.put("/{source_id}")
def update_source(source_id: UUID, request: UpdateSourceRequest, db: Session = Depends(get_db)):
    return source.update_source(db, source_id, request)


@router.delete("/{source_id}")
def delete_source(source_id: UUID, db: Session = Depends(get_db)):
    return source.delete_source(db, source_id)


@router.post("/test")
def test_existing_source(
    request: CreateSourceRequest | UpdateSourceRequest, db: Session = Depends(get_db)
):
    user_email = ""
    return source.test_source(db, request, user_email=user_email)
