from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.schemas.app import CreateApp, UpdateApp
from server.utils.connect import get_db
from server.utils.authorization import generate_resource_dependency, RESOURCES

authorize_app_actions = generate_resource_dependency(RESOURCES.APP)
router = APIRouter(prefix="/app", tags=["app"], dependencies=[Depends(authorize_app_actions)])


@router.get("/{app_id}")
def get_app(app_id: UUID, db: Session = Depends(get_db)):
    return crud.app.get_object_by_id_or_404(db, id=app_id)


@router.post("/")
def create_app(request: CreateApp, db: Session = Depends(get_db)):
    return crud.app.create(db, request)


@router.put("/{app_id}")
def update_app(app_id: UUID, request: UpdateApp, db: Session = Depends(get_db)):
    return crud.app.update_by_pk(db, app_id, request)


@router.delete("/{app_id}")
def delete_app(app_id: UUID, db: Session = Depends(get_db)):
    return crud.app.remove(db, id=app_id)
