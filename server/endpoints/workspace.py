from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from server import crud
from server.schemas.workspace import CreateWorkspace, UpdateWorkspace, AddUserRequest
from server.utils.connect import get_db
from server.controllers import workspace as workspace_controller
from server.utils.authorization import RESOURCES, AuthZDepFactory


workspace_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.WORKSPACE)

router = APIRouter(
    prefix="/workspace",
    tags=["workspace"],
    dependencies=[Depends(workspace_authorizer)],
)


@router.get("/{workspace_id}")
def get_workspace(workspace_id: UUID, db: Session = Depends(get_db)):
    return crud.workspace.get_object_by_id_or_404(db, id=workspace_id)


@router.get("/{workspace_id}/users")
def get_workspace_users(workspace_id: UUID, db: Session = Depends(get_db)):
    return workspace_controller.get_workspace_users(db, workspace_id=workspace_id)


@router.get("/{workspace_id}/groups")
def get_workspace_groups(workspace_id: UUID, db: Session = Depends(get_db)):
    return workspace_controller.get_workspace_groups(db, workspace_id=workspace_id)


@router.post("/{workspace_id}/add_user")
def add_user_to_workspace(workspace_id: UUID, request: AddUserRequest, db: Session = Depends(get_db)):
    return workspace_controller.add_user_to_workspace(
        db, workspace_id, request.user_email, request.role_id
    )


@router.post("/{workspace_id}/generate_token")
def add_token_to_workspace(workspace_id: UUID, db: Session = Depends(get_db)):
    return workspace_controller.add_token_to_workspace(db, workspace_id=workspace_id)


@router.post("/")
def create_workspace(request: CreateWorkspace, db: Session = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Endpoint POST /workspace is not implemented")
    return crud.workspace.create(db, obj_in=request)


@router.put("/{workspace_id}")
def update_workspace(workspace_id: UUID, request: UpdateWorkspace, db: Session = Depends(get_db)):
    return crud.workspace.update_by_pk(db, pk=workspace_id, obj_in=request)


@router.delete("/{workspace_id}")
def delete_workspace(workspace_id: UUID, db: Session = Depends(get_db)):
    return crud.workspace.remove(db, id=workspace_id)
