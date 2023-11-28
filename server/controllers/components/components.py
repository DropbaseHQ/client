import logging
from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.schemas.components import (
    ButtonDefined,
    CreateComponents,
    InputDefined,
    ReorderComponents,
    SelectDefined,
    TextDefined,
    UpdateComponents,
)
from server.utils.components import (
    component_type_mapper,
    order_components,
    process_after_property,
)
from server.utils.converter import get_class_properties
from server.utils.state_context import get_state_context_payload

logger = logging.getLogger(__name__)


def create_component(db: Session, request: CreateComponents):
    ComponentClass = component_type_mapper[request.type]
    comp_property = ComponentClass(**request.property)
    request.property = comp_property
    request = process_after_property(db=db, component=request)
    component = crud.components.create(db, obj_in=request)
    page = crud.page.get_page_by_widget(db, widget_id=component.widget_id)
    return {
        "state_context": get_state_context_payload(db, page.id),
        "component": component,
    }


def update_component(db: Session, components_id: UUID, request: UpdateComponents):
    ComponentClass = component_type_mapper[request.type]
    component = ComponentClass(**request.property)
    request.property = component.dict()
    component = crud.components.update_by_pk(db=db, pk=components_id, obj_in=request)
    page = crud.page.get_page_by_widget(db, widget_id=component.widget_id)
    return get_state_context_payload(db, page.id)


def get_widget_components_and_props(db: Session, widget_id: UUID):
    components = crud.components.get_widget_component(db, widget_id=widget_id)
    ordered_comp = order_components(components)
    schema = {
        "input": get_class_properties(InputDefined),
        "select": get_class_properties(SelectDefined),
        "button": get_class_properties(ButtonDefined),
        "text": get_class_properties(TextDefined),
    }
    return {"schema": schema, "values": ordered_comp}


def delete_component(db: Session, components_id: UUID):
    component = crud.components.get_object_by_id_or_404(db, id=components_id)
    widget_id = component.widget_id
    next_component = crud.components.get_component_by_after(
        db, widget_id=component.widget_id, after=component.id
    )
    if next_component:
        next_component.after = component.after
        db.commit()
    db.delete(component)
    db.commit()
    page = crud.page.get_page_by_widget(db, widget_id=widget_id)
    return get_state_context_payload(db, page.id)


def reorder_component(db: Session, request: ReorderComponents):
    # if request.after is None:
    component = crud.components.get_object_by_id_or_404(db, id=request.component_id)
    current_component = crud.components.get_component_by_after(
        db, widget_id=request.widget_id, after=request.after
    )
    # get component currently at that position
    component.after = request.after
    current_component.after = component.id
    db.commit()
