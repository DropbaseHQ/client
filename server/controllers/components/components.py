import logging
from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.schemas.components import Button, CreateComponents, InputBaseProperties, UpdateComponents
from server.utils.converter import get_class_properties

logger = logging.getLogger(__name__)


component_type_to_schema_mapper = {"input": InputBaseProperties, "button": Button}


def create_component(db: Session, request: CreateComponents):
    ComponentClass = component_type_to_schema_mapper[request.type]
    ComponentClass(**request.property)
    # request.property = component
    return crud.components.create(db, obj_in=request)


def update_component(db: Session, components_id: UUID, request: UpdateComponents):
    ComponentClass = component_type_to_schema_mapper[request.type]
    component = ComponentClass(**request.property)
    request.property = component.dict()
    return crud.components.update_by_pk(db=db, pk=components_id, obj_in=request)


def get_widget_components_and_props(db: Session, widget_id: UUID):
    components = crud.components.get_widget_component(db, widget_id=widget_id)
    column_props = get_class_properties(InputBaseProperties)
    return {"schema": column_props, "values": components}
