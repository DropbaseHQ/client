from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session

from server import crud
from server.models import User
from server.controllers.user import get_user_permissions, user_controller
from server.schemas.user import (
    CreateUser,
    CreateUserRequest,
    LoginUser,
    ResetPasswordRequest,
    UpdateUser,
    AddPolicyRequest,
    UpdateUserPolicyRequest,
)
from server.schemas import PolicyTemplate
from server.utils.authorization import (
    RESOURCES,
    verify_user_id_belongs_to_current_user,
    get_current_user,
)

from server.utils.connect import get_db


router = APIRouter(prefix="/user", tags=["user"])


from server.utils.authentication import get_current_user


@router.get("/workspaces")
def get_user_worpsaces(db: Session = Depends(get_db), user: Any = Depends(get_current_user)):
    return user_controller.get_user_workspaces(db, user_id=user.id)


@router.post("/register")
def register_user(request: CreateUserRequest, db: Session = Depends(get_db)):
    return user_controller.register_user(db, request)


@router.post("/login")
def login_user(request: LoginUser, db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    return user_controller.login_user(db, Authorize, request)


@router.delete("/logout")
def logout_user(response: Response, Authorize: AuthJWT = Depends()):
    return user_controller.logout_user(response, Authorize)


@router.post("/refresh")
def refresh_token(Authorize: AuthJWT = Depends()):
    return user_controller.refresh_token(Authorize)


@router.post("/reset_password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    return user_controller.reset_password(db, request)


@router.get("/{user_id}/details/{workspace_id}")
def get_user_details(user_id: UUID, workspace_id: UUID, db: Session = Depends(get_db)):
    # verify_user_id_belongs_to_current_user(user_id)
    return get_user_permissions(db=db, user_id=user_id, workspace_id=workspace_id)


@router.get("")
def get_user(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return crud.user.get_object_by_id_or_404(db, id=user.id)


@router.post("/")
def create_user(request: CreateUser, db: Session = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Endpoint POST /user is not implemented")
    return crud.user.create(db, request)


@router.put("/{user_id}")
def update_user(user_id: UUID, request: UpdateUser, db: Session = Depends(get_db)):
    verify_user_id_belongs_to_current_user(user_id)
    return crud.user.update_by_pk(db, user_id, request)


@router.delete("/{user_id}")
def delete_user(user_id: UUID, db: Session = Depends(get_db)):
    verify_user_id_belongs_to_current_user(user_id)
    return crud.user.remove(db, id=user_id)


@router.post("/add_policies/{user_id}")
def add_policies_to_user(user_id: UUID, request: AddPolicyRequest, db: Session = Depends(get_db)):
    return user_controller.add_policy(db, user_id, request)


@router.post("/remove_policies/{user_id}")
def remove_policies_from_user(user_id: UUID, request: AddPolicyRequest, db: Session = Depends(get_db)):
    return user_controller.remove_policy(db, user_id, request)


@router.post("/update_policy/{user_id}")
def update_policy_from_user(
    user_id: UUID, request: UpdateUserPolicyRequest, db: Session = Depends(get_db)
):
    return user_controller.update_policy(db, user_id, request)
