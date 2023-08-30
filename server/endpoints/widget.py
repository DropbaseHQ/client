from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.utils.authorization import RESOURCES, generate_resource_dependency
from server.utils.connect import get_db

authorize_widget_widgets = generate_resource_dependency(RESOURCES.WIDGET)

router = APIRouter(prefix="/widget", tags=["widget"], dependencies=[Depends(authorize_widget_widgets)])


@router.get("/{widget_id}")
def get_widget(widget_id: UUID, db: Session = Depends(get_db)):
    return crud.widget.get_object_by_id_or_404(db, id=widget_id)
