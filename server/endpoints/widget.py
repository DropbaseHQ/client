from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.schemas.widget import CreateWidget, UpdateWidget
from server.utils.authorization import RESOURCES, generate_resource_dependency
from server.utils.connect import get_db

authorize_widget_widgets = generate_resource_dependency(RESOURCES.WIDGET)

router = APIRouter(prefix="/widget", tags=["widget"], dependencies=[Depends(authorize_widget_widgets)])


@router.get("/{widget_id}")
def get_widget(widget_id: UUID, db: Session = Depends(get_db)):
    return crud.widget.get_object_by_id_or_404(db, id=widget_id)


@router.post("/")
def create_widget(request: CreateWidget, db: Session = Depends(get_db)):
    request.name = request.property.name
    return crud.widget.create(db, obj_in=request)


@router.put("/{widget_id}")
def update_widget(widget_id: UUID, request: UpdateWidget, db: Session = Depends(get_db)):
    return crud.widget.update_by_pk(db, id=widget_id, obj_in=request)


@router.delete("/{widget_id}")
def delete_widget(widget_id: UUID, db: Session = Depends(get_db)):
    return crud.widget.remove(db, id=widget_id)
