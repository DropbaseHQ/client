from uuid import UUID

from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session

from server import crud
from server.schemas.components import CreateComponents, UpdateComponents, ConvertComponents
from server.utils.connect import get_db
from server.controllers.components import components
from server.utils.authorization import generate_resource_dependency

authorize_components_actions = generate_resource_dependency("components")
router = APIRouter(
    prefix="/components", tags=["components"], dependencies=[Depends(authorize_components_actions)]
)


@router.get("/{components_id}")
def get_components(components_id: UUID, db: Session = Depends(get_db)):
    return crud.components.get_object_by_id_or_404(db, id=components_id)


@router.post("/")
def create_components(request: CreateComponents, db: Session = Depends(get_db)):
    return components.create_components(db, request)


@router.put("/{components_id}")
def update_components(components_id: UUID, request: UpdateComponents, db: Session = Depends(get_db)):
    return components.update_components(db, request, components_id)


@router.delete("/{components_id}")
def delete_components(components_id: UUID, db: Session = Depends(get_db)):
    return crud.components.remove(db, id=components_id)


@router.post("/{components_id}/convert")
def convert_components(
    components_id: str, request: ConvertComponents, response: Response, db: Session = Depends(get_db)
):
    return components.convert_components(request, response)
