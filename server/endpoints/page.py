from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers.page import page
from server.schemas.page import CreatePage, UpdatePage
from server.utils.connect import get_db
from server.utils.authorization import generate_resource_dependency

authorize_page_actions = generate_resource_dependency("page")
router = APIRouter(prefix="/page", tags=["page"], dependencies=[Depends(authorize_page_actions)])


@router.get("/{page_id}")
def get_page(page_id: UUID, db: Session = Depends(get_db)):
    return page.get_page_details(db, page_id=page_id)


@router.post("/")
def create_page(request: CreatePage, db: Session = Depends(get_db)):
    return crud.page.create(db, request)


@router.put("/{page_id}")
def update_page(page_id: UUID, request: UpdatePage, db: Session = Depends(get_db)):
    return crud.page.update_by_pk(db, page_id, request)


@router.delete("/{page_id}")
def delete_page(page_id: UUID, db: Session = Depends(get_db)):
    return crud.page.remove(db, id=page_id)


@router.get("/{page_id}/schema")
def get_page_schema(page_id: str, db: Session = Depends(get_db)):
    return page.get_page_schema()
