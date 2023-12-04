from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers.app import finalize_app
from server.schemas import FinalizeApp, RenameApp
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db

app_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.APP)
router = APIRouter(
    prefix="/app",
    tags=["app"],
    # dependencies=[Depends(app_authorizer)],
)


@router.get("/{app_id}")
def get_app(app_id: UUID, db: Session = Depends(get_db)):
    return crud.app.get_object_by_id_or_404(db, id=app_id)


@router.put("/rename")
def rename_app(request: RenameApp, db: Session = Depends(get_db)):
    return crud.app.update_by_pk(db, pk=request.app_id, obj_in={"name": request.new_name})


@router.put("/{app_id}")
def update_app(app_id: UUID, request: FinalizeApp, db: Session = Depends(get_db)):
    return finalize_app(db, app_id, request)


@router.delete("/{app_id}")
def delete_app(app_id: UUID, db: Session = Depends(get_db)):
    return crud.app.remove(db, id=app_id)
