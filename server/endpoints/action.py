from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.schemas.app import CreateApp, UpdateApp
from server.utils.connect import get_db
from server.utils.authorization import generate_resource_dependency, RESOURCES

authorize_action_actions = generate_resource_dependency(RESOURCES.ACTION)

router = APIRouter(prefix="/action", tags=["action"], dependencies=[Depends(authorize_action_actions)])


@router.get("/{action_id}")
def get_action(action_id: UUID, db: Session = Depends(get_db)):
    return crud.action.get_object_by_id_or_404(db, id=action_id)
