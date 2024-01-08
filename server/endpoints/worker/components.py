from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers import components as components_controller
from server.schemas.components import CreateComponents, ReorderComponentsRequest, UpdateComponents
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db

components_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.COMPONENTS)

router = APIRouter(prefix="/components", tags=["components"])


@router.post("/")
def create_component(request: CreateComponents, db: Session = Depends(get_db)):
    return components_controller.create_component(db, request)


@router.put("/{components_id}")
def update_components(components_id: UUID, request: UpdateComponents, db: Session = Depends(get_db)):
    return components_controller.update_component(db, components_id, request)


@router.delete("/{components_id}")
def delete_components(components_id: UUID, db: Session = Depends(get_db)):
    return components_controller.delete_component(db, components_id)
