from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.schemas.user import CreateUser, UpdateUser
from server.utils.connect import get_db

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
