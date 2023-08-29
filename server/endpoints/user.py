from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi_jwt_auth import AuthJWT

from sqlalchemy.orm import Session
from server import crud
from server.schemas.user import CreateUser, UpdateUser, LoginUser, CreateUserRequest
from server.utils.connect import get_db
from server.controllers.user import user

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/{user_id}")
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    return crud.user.get_object_by_id_or_404(db, id=user_id)


@router.post("/")
def create_user(request: CreateUser, db: Session = Depends(get_db)):
    return crud.user.create(db, request)


@router.put("/{user_id}")
def update_user(user_id: UUID, request: UpdateUser, db: Session = Depends(get_db)):
    return crud.user.update_by_pk(db, user_id, request)


@router.delete("/{user_id}")
def delete_user(user_id: UUID, db: Session = Depends(get_db)):
    return crud.user.remove(db, id=user_id)


@router.post("/register")
def register_user(request: CreateUserRequest, db: Session = Depends(get_db)):
    return user.register_user(db, request)


@router.post("/login")
def login_user(request: LoginUser, db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    return user.login_user(db, Authorize, request)


@router.post("/logout")
def logout_user(Authorize: AuthJWT = Depends()):
    return user.logout_user(Authorize)


@router.post("/refresh")
def refresh_token(Authorize: AuthJWT = Depends()):
    return user.refresh_token(Authorize)
