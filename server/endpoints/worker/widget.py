from fastapi import APIRouter, Depends
from server import crud
from sqlalchemy.orm import Session
from server.schemas.widget import CreateWidget, UpdateWidget, WidgetBaseProperty
from server.controllers import widget as widget_controller
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db
from uuid import UUID

widget_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.WIDGET)

router = APIRouter(
    prefix="/widget", tags=["widget"], dependencies=[Depends(widget_authorizer)]
)


@router.post("/")
def create_widget(request: CreateWidget, db: Session = Depends(get_db)):
    return widget_controller.create_widget(db, request)


@router.put("/{widget_id}")
def update_widget(
    widget_id: UUID, request: UpdateWidget, db: Session = Depends(get_db)
):
    return widget_controller.update_widget(db, widget_id, request)


@router.delete("/{widget_id}")
def delete_widget(widget_id: UUID, db: Session = Depends(get_db)):
    return widget_controller.delete_widget(db, widget_id)
