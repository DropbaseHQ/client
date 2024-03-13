from uuid import UUID
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.controllers.policy import (
    PolicyUpdater,
)

from server import crud
from server.schemas import AppShareRequest

from server.utils.connect import get_db

router = APIRouter(prefix="/app", tags=["app"])


class UpdateAppRequest(BaseModel):
    resource: str
    action: str


@router.post("/{app_id}/share")
def share_app(app_id: UUID, request: AppShareRequest, db: Session = Depends(get_db)):
    target_app = crud.app.get_object_by_id_or_404(db=db, id=app_id)

    successful_changes = []
    for subject_id in request.subjects:
        policy_updater = PolicyUpdater(
            db=db,
            subject_id=subject_id,
            workspace_id=target_app.workspace_id,
            request=UpdateAppRequest(resource=str(app_id), action=request.action),
        )
        policy_updater.update_policy()
        successful_changes.append(
            {
                "subject_id": subject_id,
                "action": request.action,
                "resource": app_id,
            }
        )

    return successful_changes
