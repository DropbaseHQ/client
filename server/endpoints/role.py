from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.schemas.role import CreateRole, UpdateRole
from server.utils.connect import get_db

router = APIRouter(prefix="/role", tags=["role"])


@router.get("/{role_id}")
def get_role(role_id: UUID, db: Session = Depends(get_db)):
    return crud.role.get_object_by_id_or_404(db, id=role_id)


@router.post("/")
def create_role(request: CreateRole, db: Session = Depends(get_db)):
    return crud.role.create(db, obj_in=request)


@router.put("/{role_id}")
def update_role(role_id: UUID, request: UpdateRole, db: Session = Depends(get_db)):
    return crud.role.update_by_pk(db, pk=role_id, obj_in=request)


@router.delete("/{role_id}")
def delete_role(role_id: UUID, db: Session = Depends(get_db)):
    return crud.role.remove(db, id=role_id)
