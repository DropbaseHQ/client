from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.schemas.widget import CreateWidget, UpdateWidget, WidgetBaseProperty
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.components import order_components
from server.utils.connect import get_db
from server.utils.converter import get_class_properties


widget_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.WIDGET)

router = APIRouter(
    prefix="/widget",
    tags=["widget"],
    dependencies=[Depends(widget_authorizer)],
)


@router.get("/{widget_id}")
def get_widget(widget_id: UUID, db: Session = Depends(get_db)):
    widget = crud.widget.get_object_by_id_or_404(db, id=widget_id)
    widget_props = get_class_properties(WidgetBaseProperty)
    return {"schema": widget_props, "values": widget}


@router.post("/", dependencies=[Depends(widget_authorizer.use_params(resource_type=RESOURCES.PAGE))])
def create_widget(request: CreateWidget, db: Session = Depends(get_db)):
    request.name = request.property.name
    return crud.widget.create(db, obj_in=request)


@router.put("/{widget_id}")
def update_widget(widget_id: UUID, request: UpdateWidget, db: Session = Depends(get_db)):
    request.name = request.property.name
    return crud.widget.update_by_pk(db, pk=widget_id, obj_in=request)


@router.delete("/{widget_id}")
def delete_widget(widget_id: UUID, db: Session = Depends(get_db)):
    return crud.widget.remove(db, id=widget_id)


@router.get("/ui/{widget_id}")
def get_widget_ui(widget_id: UUID, db: Session = Depends(get_db)):
    widget = crud.widget.get_object_by_id_or_404(db, id=widget_id)
    components = crud.components.get_widget_component(db, widget_id=widget_id)
    ordered_comp = order_components(components)
    return {"widget": widget, "components": ordered_comp}
