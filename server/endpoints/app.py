from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers import app as app_controller
from server.models import User
from server.schemas.app import CreateApp, UpdateApp
from server.utils.authorization import (
    RESOURCES,
    get_current_user,
    AuthZDepFactory,
)
from server.utils.connect import get_db


app_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.APP)
router = APIRouter(
    prefix="/app",
    tags=["app"],
    dependencies=[
        Depends(app_authorizer),
    ],
)


@router.get("/list")
def get_user_apps(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return app_controller.get_user_apps(db, user)


@router.get("/{app_id}")
def get_app(app_id: UUID, db: Session = Depends(get_db)):
    return crud.app.get_object_by_id_or_404(db, id=app_id)


@router.post("/")
def create_app(
    request: CreateApp, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    return app_controller.create_app(db, request, user)


@router.put("/{app_id}")
def update_app(app_id: UUID, request: UpdateApp, db: Session = Depends(get_db)):
    return crud.app.update_by_pk(db, pk=app_id, obj_in=request)


@router.delete("/{app_id}")
def delete_app(app_id: UUID, db: Session = Depends(get_db)):
    return crud.app.remove(db, id=app_id)


@router.get("/{app_id}/pages")
def get_app_pages(app_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return app_controller.get_app_pages(db, user, app_id)
