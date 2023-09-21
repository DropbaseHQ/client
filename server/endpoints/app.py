from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.schemas.app import CreateApp, UpdateApp
from server.models import User
from server.utils.connect import get_db
from server.utils.authorization import generate_resource_dependency, RESOURCES, get_current_user
from server.controllers import app as app_controller

authorize_app_actions = generate_resource_dependency(RESOURCES.APP)
authorize_components_actions = generate_resource_dependency(RESOURCES.COMPONENTS)
router = APIRouter(
    prefix="/app",
    tags=["app"],
    dependencies=[
        Depends(authorize_app_actions),
        Depends(authorize_components_actions),
    ],
)


@router.get("/list")
def get_user_apps(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return app_controller.get_user_apps(db, user)


@router.get("/{app_id}")
def get_app(app_id: UUID, db: Session = Depends(get_db)):
    return crud.app.get_object_by_id_or_404(db, id=app_id)


authorize_app_creation = generate_resource_dependency(RESOURCES.WORKSPACE, is_on_resource_creation=True)
@router.post("/", dependencies=[Depends(authorize_app_creation)])
def create_app(
    request: CreateApp, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    return app_controller.create_app(db, request, user)


@router.put("/{app_id}")
def update_app(app_id: UUID, request: UpdateApp, db: Session = Depends(get_db)):
    return crud.app.update_by_pk(db, app_id, request)


@router.delete("/{app_id}")
def delete_app(app_id: UUID, db: Session = Depends(get_db)):
    return crud.app.remove(db, id=app_id)


@router.get("/{app_id}/pages")
def get_app_pages(app_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return app_controller.get_app_pages(db, user, app_id)
