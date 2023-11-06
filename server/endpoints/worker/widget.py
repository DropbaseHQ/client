from fastapi import APIRouter, Depends
from server import crud
from sqlalchemy.orm import Session
from server.schemas.widget import CreateWidget, UpdateWidget, WidgetBaseProperty
from server.utils.state_context import get_state_context_payload
from server.utils.connect import get_db
from uuid import UUID

router = APIRouter(prefix="/widget", tags=["widget"])


@router.post("/")
def create_widget(request: CreateWidget, db: Session = Depends(get_db)):
    request.name = request.property.name
    widget = crud.widget.create(db, obj_in=request)
    return get_state_context_payload(db, widget.page_id)


@router.put("/{widget_id}")
def update_widget(widget_id: UUID, request: UpdateWidget, db: Session = Depends(get_db)):
    request.name = request.property.name
    widget = crud.widget.update_by_pk(db, pk=widget_id, obj_in=request)
    return get_state_context_payload(db, widget.page_id)


@router.delete("/{widget_id}")
def delete_widget(widget_id: UUID, db: Session = Depends(get_db)):
    page = crud.page.get_page_by_widget(db, widget_id=widget_id)
    crud.widget.remove(db, id=widget_id)
    return get_state_context_payload(db, page.id)
