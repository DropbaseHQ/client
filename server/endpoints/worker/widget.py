from fastapi import APIRouter, Depends
from server import crud
from sqlalchemy.orm import Session
from server.schemas.widget import CreateWidget, UpdateWidget, WidgetBaseProperty
from server.controllers import widget as widget_controller
from server.utils.state_context import get_state_context_payload
from server.utils.connect import get_db
from uuid import UUID

router = APIRouter(prefix="/widget", tags=["widget"])


@router.post("/")
def create_widget(request: CreateWidget, db: Session = Depends(get_db)):
    widget_controller.create_widget(db, request)


@router.put("/{widget_id}")
def update_widget(widget_id: UUID, request: UpdateWidget, db: Session = Depends(get_db)):
    widget_controller.update_widget(db, widget_id, request)


@router.delete("/{widget_id}")
def delete_widget(widget_id: UUID, db: Session = Depends(get_db)):
    widget_controller.delete_widget(db, widget_id)
