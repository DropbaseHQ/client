from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from server import crud
from server.controllers.components import (
    create_component,
    delete_component,
    get_widget_components_and_props,
    reorder_component,
    update_component,
)
from server.schemas.components import CreateComponents, ReorderComponents, UpdateComponents
from server.utils.authorization import RESOURCES, generate_resource_dependency
from server.utils.connect import get_db

authorize_widget_actions = generate_resource_dependency(RESOURCES.WIDGET)
authorize_components_actions = generate_resource_dependency(RESOURCES.COMPONENTS)


router = APIRouter(
    prefix="/components",
    tags=["components"],
    dependencies=[Depends(authorize_widget_actions), Depends(authorize_components_actions)],
)


@router.get("/widget/{widget_id}")
def get_widget_components(widget_id: UUID, db: Session = Depends(get_db)):
    return get_widget_components_and_props(db, widget_id=widget_id)


@router.get("/{components_id}")
def get_components(components_id: UUID, db: Session = Depends(get_db)):
    return crud.components.get_object_by_id_or_404(db, id=components_id)


authorize_components_creation = generate_resource_dependency(
    RESOURCES.WIDGET, is_on_resource_creation=True
)


@router.post("/", dependencies=[Depends(authorize_components_creation)])
def create_components(request: CreateComponents, db: Session = Depends(get_db)):
    return create_component(db, request)


@router.put("/{components_id}")
def update_components(components_id: UUID, request: UpdateComponents, db: Session = Depends(get_db)):
    return update_component(db, components_id, request)


@router.delete("/{components_id}")
def delete_components(components_id: UUID, db: Session = Depends(get_db)):
    return delete_component(db, components_id)


@router.post("/reorder")
def reorder_components(request: ReorderComponents, db: Session = Depends(get_db)):
    return reorder_component(db, request)
