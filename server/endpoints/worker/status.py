from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db

widget_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.WIDGET)

router = APIRouter(prefix="/status", tags=["status"])


@router.get("/")
def get_app(app_id: UUID, db: Session = Depends(get_db)):
    return crud.app.get_object_by_id_or_404(db, id=app_id)
