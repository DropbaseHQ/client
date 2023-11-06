from fastapi import APIRouter, Depends
from server import crud
from sqlalchemy.orm import Session
from server.schemas import FinalizeApp
from server.utils.connect import get_db
from server.controllers.app import finalize_app
from server.utils.state_context import get_state_context_payload
from uuid import UUID

router = APIRouter(prefix="/app", tags=["app"])


@router.get("/{app_id}")
def get_app(app_id: UUID, db: Session = Depends(get_db)):
    return crud.app.get_object_by_id_or_404(db, id=app_id)


@router.put("/{app_id}")
def update_app(app_id: UUID, request: FinalizeApp, db: Session = Depends(get_db)):
    return finalize_app(db, app_id, request)


@router.delete("/{app_id}")
def delete_app(app_id: UUID, db: Session = Depends(get_db)):
    return crud.app.remove(db, id=app_id)
