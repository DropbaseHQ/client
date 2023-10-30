from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.utils.connect import get_db
from server import crud
from server.schemas.app import UpdateApp


router = APIRouter(
    prefix="/app",
    tags=["app"],
)


@router.get("/{app_id}")
def get_app(app_id: UUID, db: Session = Depends(get_db)):
    return crud.app.get_object_by_id_or_404(db, id=app_id)


@router.put("/{app_id}")
def update_app(app_id: UUID, request: UpdateApp, db: Session = Depends(get_db)):
    return crud.app.update_by_pk(db=db, pk=app_id, obj_in={"is_draft": request.is_draft})
