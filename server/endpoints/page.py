from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers.page import page
from server.schemas.page import CreatePage, UpdatePage
from server.utils.authorization import RESOURCES, generate_resource_dependency
from server.utils.connect import get_db

authorize_page_actions = generate_resource_dependency(RESOURCES.PAGE)
authorize_components_actions = generate_resource_dependency(RESOURCES.COMPONENTS)
router = APIRouter(
    prefix="/page",
    tags=["page"],
    dependencies=[
        Depends(authorize_page_actions),
        Depends(authorize_components_actions),
    ],
)


@router.get("/{page_id}")
def get_page(page_id: UUID, db: Session = Depends(get_db)):
    return page.get_page_details(db, page_id=page_id)


authorize_page_creation = generate_resource_dependency(RESOURCES.APP, is_on_resource_creation=True)


@router.post("/", dependencies=[Depends(authorize_page_creation)])
def create_page(request: CreatePage, db: Session = Depends(get_db)):
    return crud.page.create(db, obj_in=request)


@router.put("/{page_id}")
def update_page(page_id: UUID, request: UpdatePage, db: Session = Depends(get_db)):
    return crud.page.update_by_pk(db, pk=page_id, obj_in=request)


@router.delete("/{page_id}")
def delete_page(page_id: UUID, db: Session = Depends(get_db)):
    return crud.page.remove(db, id=page_id)


@router.get("/schema/{page_id}")
def get_page_schema(page_id: str, db: Session = Depends(get_db)):
    return page.get_page_schema(db, page_id)
