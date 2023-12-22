from sqlalchemy.orm import Session
from server.schemas.widget import CreateWidget, UpdateWidget
from server.utils.state_context import get_state_context_payload
from server import crud
from uuid import UUID


def create_widget(db: Session, request: CreateWidget):
    request.name = request.property.name
    request.property = {
        "name": request.property.name,
        "description": "",
    }
    widget = crud.widget.create(db, obj_in=request)
    state_context = get_state_context_payload(db, widget.page_id)
    return {
        "widget": widget,
        "state_context": state_context,
    }


def update_widget(db: Session, widget_id: UUID, request: UpdateWidget):
    request.name = request.property.name
    widget = crud.widget.update_by_pk(db, pk=widget_id, obj_in=request)
    return get_state_context_payload(db, widget.page_id)


def delete_widget(db: Session, widget_id):
    page = crud.page.get_page_by_widget(db, widget_id=widget_id)
    crud.widget.remove(db, id=widget_id)
    return get_state_context_payload(db, page.id)
