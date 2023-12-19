from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers.components import (
    get_widget_components_and_props,
    reorder_component,
)
from server.schemas.components import ReorderComponentsRequest
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db

components_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.COMPONENTS)

router = APIRouter(
    prefix="/components",
    tags=["components"],
    dependencies=[Depends(components_authorizer)],
)

router = APIRouter(prefix="/components", tags=["components"])


@router.get(
    "/widget/{widget_id}",
    dependencies=[
        Depends(components_authorizer.use_params(resource_type=RESOURCES.WIDGET))
    ],
)
def get_widget_components(widget_id: UUID, db: Session = Depends(get_db)):
    return get_widget_components_and_props(db, widget_id=widget_id)


@router.get("/{components_id}")
def get_components(components_id: UUID, db: Session = Depends(get_db)):
    return crud.components.get_object_by_id_or_404(db, id=components_id)


@router.post("/reorder")
def reorder_components(
    request: ReorderComponentsRequest, db: Session = Depends(get_db)
):
    return reorder_component(db, request)
