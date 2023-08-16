from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from server import crud
from server.schemas.components import CreateComponents, UpdateComponents, ConvertComponents
from server.utils.connect import get_db
from server.controllers.components import components

router = APIRouter(prefix="/components", tags=["components"])


@router.get("/{components_id}")
def get_components(components_id: UUID, db: Session = Depends(get_db)):
    return crud.components.get_object_by_id_or_404(db, id=components_id)


@router.post("/")
def create_components(request: CreateComponents, db: Session = Depends(get_db)):
    return crud.components.create(db, obj_in=request)


@router.put("/{components_id}")
def update_components(components_id: UUID, request: UpdateComponents, db: Session = Depends(get_db)):
    return crud.components.update_by_pk(db=db, pk=components_id, obj_in=request)


@router.delete("/{components_id}")
def delete_components(components_id: UUID, db: Session = Depends(get_db)):
    return crud.components.remove(db, id=components_id)


@router.post("/{components_id}/convert")
def convert_components(components_id: str, request: ConvertComponents, db: Session = Depends(get_db)):
    return components.convert_components(request)
