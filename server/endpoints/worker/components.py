from fastapi import APIRouter, Depends
from server import crud
from sqlalchemy.orm import Session
from server.schemas.components import CreateComponents, ReorderComponents, UpdateComponents
from server.utils.connect import get_db
from server.controllers.components import (
    create_component,
    delete_component,
    get_widget_components_and_props,
    reorder_component,
    update_component,
)
from uuid import UUID

router = APIRouter(prefix="/components", tags=["components"])


@router.post("/")
def create_component(request: CreateComponents, db: Session = Depends(get_db)):
    return create_component(db, request)


@router.put("/{components_id}")
def update_components(components_id: UUID, request: UpdateComponents, db: Session = Depends(get_db)):
    return update_component(db, components_id, request)


@router.delete("/{components_id}")
def delete_components(components_id: UUID, db: Session = Depends(get_db)):
    return delete_component(db, components_id)
