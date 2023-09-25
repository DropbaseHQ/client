from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session

from server import crud
from server.controllers.user import user
from server.schemas.user import (
    CreateUser,
    CreateUserRequest,
    LoginUser,
    ResetPasswordRequest,
    UpdateUser,
)
from server.utils.authorization import (
    RESOURCES,
    generate_resource_dependency,
    verify_user_id_belongs_to_current_user,
)
from server.utils.connect import get_db

authorize_components_actions = generate_resource_dependency(RESOURCES.COMPONENTS)
router = APIRouter(prefix="/user", tags=["user"])


from server.utils.authentication import get_current_user


@router.get("/workspaces")
def get_user_worpsaces(db: Session = Depends(get_db), user: Any = Depends(get_current_user)):
    return crud.workspace.get_user_workspaces(db, user_id=user.id)


@router.post("/register")
def register_user(request: CreateUserRequest, db: Session = Depends(get_db)):
    return user.register_user(db, request)


@router.post("/login")
def login_user(request: LoginUser, db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    return user.login_user(db, Authorize, request)


@router.delete("/logout", dependencies=[Depends(authorize_components_actions)])
def logout_user(response: Response, Authorize: AuthJWT = Depends()):
    return user.logout_user(response, Authorize)


@router.post("/refresh")
def refresh_token(Authorize: AuthJWT = Depends()):
    return user.refresh_token(Authorize)


@router.post("/reset_password", dependencies=[Depends(authorize_components_actions)])
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    return user.reset_password(db, request)


@router.get("/{user_id}", dependencies=[Depends(authorize_components_actions)])
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    verify_user_id_belongs_to_current_user(user_id)
    return crud.user.get_object_by_id_or_404(db, id=user_id)


@router.post("/")
def create_user(request: CreateUser, db: Session = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Endpoint POST /user is not implemented")
    return crud.user.create(db, request)


@router.put("/{user_id}", dependencies=[Depends(authorize_components_actions)])
def update_user(user_id: UUID, request: UpdateUser, db: Session = Depends(get_db)):
    verify_user_id_belongs_to_current_user(user_id)
    return crud.user.update_by_pk(db, user_id, request)


@router.delete("/{user_id}", dependencies=[Depends(authorize_components_actions)])
def delete_user(user_id: UUID, db: Session = Depends(get_db)):
    verify_user_id_belongs_to_current_user(user_id)
    return crud.user.remove(db, id=user_id)
