from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.schemas.components import CreateComponents, UpdateComponents
from server.utils.connect import get_db

router = APIRouter(prefix="/components", tags=["components"])


@router.get("/{components_id}")
def get_components(components_id: UUID, db: Session = Depends(get_db)):
    return crud.components.get_object_by_id_or_404(db, id=components_id)


@router.post("/")
def create_components(request: CreateComponents, db: Session = Depends(get_db)):
    return crud.components.create(db, request)


@router.put("/{components_id}")
def update_components(components_id: UUID, request: UpdateComponents, db: Session = Depends(get_db)):
    return crud.components.update_by_pk(db, components_id, request)


@router.delete("/{components_id}")
def delete_components(components_id: UUID, db: Session = Depends(get_db)):
    return crud.components.remove(db, id=components_id)
