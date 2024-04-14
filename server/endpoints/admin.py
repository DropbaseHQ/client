from uuid import UUID
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from server import crud
from server.schemas import (
    CheckPermissionRequest,
    CreateTestUserRequest,
    CreateTestDBTableRequest,
    UpdateUserRoleRequest,
)
from server.controllers import workspace as workspace_controller
from server.controllers import user as user_controller
from server.controllers.policy import (
    PolicyUpdater,
)
from server.utils.connect import get_db


def check_power_user_token(request: Request):
    token = request.headers.get("powerUserToken")
    if token != "dropbasePowerToken":
        raise HTTPException(status_code=401, detail="Unauthorized")


router = APIRouter(
    prefix="/power",
    tags=["power"],
    dependencies=[Depends(check_power_user_token)],
)


class PowerUpdatePolicy(BaseModel):
    workspace_id: str
    resource: str
    action: str


@router.post("/update_policy/{user_id}")
def update_workspace_policy(
    user_id: UUID, request: PowerUpdatePolicy, db: Session = Depends(get_db)
):
    policy_updater = PolicyUpdater(
        db=db,
        subject_id=user_id,
        workspace_id=request.workspace_id,
        request=request,
    )
    policy_updater.update_policy()
    return {"success": True}


class PowerUpdateRole(BaseModel):
    workspace_id: UUID
    role: str


@router.post("/update_role/{user_id}")
def update_workspace_role(
    user_id: UUID, request: PowerUpdateRole, db: Session = Depends(get_db)
):
    role = crud.role.get_role_by_name(db=db, role_name=request.role)

    workspace_controller.update_user_role_in_workspace(
        db=db,
        workspace_id=request.workspace_id,
        request=UpdateUserRoleRequest(user_id=user_id, role_id=role.id),
    )
    return {"success": True}


class PowerCheckPermissions(BaseModel):
    user_id: str
    app_id: Optional[str]


@router.post("/check_permission/{workspace_id}")
def check_permissions(
    workspace_id: UUID, request: PowerCheckPermissions, db: Session = Depends(get_db)
):
    user = crud.user.get_object_by_id_or_404(db, id=request.user_id)
    workspace = crud.workspace.get_object_by_id_or_404(db, id=workspace_id)
    permissions = user_controller.check_permissions(
        db=db,
        workspace=workspace,
        user=user,
        request=CheckPermissionRequest(app_id=request.app_id),
    )
    return permissions


class PowerAddUserRequest(BaseModel):
    user_email: str
    role_id: UUID


@router.post("/{workspace_id}/add_user")
def add_user_to_workspace(
    workspace_id: UUID, request: PowerAddUserRequest, db: Session = Depends(get_db)
):
    user = crud.user.get_user_by_email(db, email=request.user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return workspace_controller.add_user_to_workspace(
        db=db, workspace_id=workspace_id, user_id=user.id, role_id=request.role_id
    )


@router.post("/{workspace_id}/remove_user")
def remove_user_from_workspace(
    workspace_id: UUID, request: PowerAddUserRequest, db: Session = Depends(get_db)
):
    user = crud.user.get_user_by_email(db, email=request.user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return workspace_controller.remove_user_from_workspace(
        db=db, workspace_id=workspace_id, user_id=user.id
    )


@router.post("/create_test_user")
def create_test_user(request: CreateTestUserRequest, db: Session = Depends(get_db)):
    return user_controller.create_test_user(db=db, request=request)


@router.post("/create_test_db_table")
def create_test_db_table(
    request: CreateTestDBTableRequest, db: Session = Depends(get_db)
):
    return user_controller.create_test_db_table(db=db, request=request)
