from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from server import crud
from server.controllers.tables import create_table, get_table, get_table_row, pin_filters, update_table
from server.controllers.tables.convert import convert_to_smart_table
from server.controllers.task.table import get_table_data
from server.schemas.tables import (
    ConvertToSmart,
    CreateTables,
    PinFilters,
    QueryTable,
    TablesReadProperty,
    UpdateTables,
)
from server.utils.connect import get_db
from server.utils.converter import get_class_properties
from server.utils.authorization import generate_resource_dependency, RESOURCES


authorize_tables_actions = generate_resource_dependency(RESOURCES.TABLES)
authorize_components_actions = generate_resource_dependency(RESOURCES.COMPONENTS)
router = APIRouter(
    prefix="/tables",
    tags=["tables"],
    dependencies=[
        Depends(authorize_tables_actions),
        Depends(authorize_components_actions),
    ],
)


@router.get("/properties")
def get_table_properties_req():
    return get_class_properties(TablesReadProperty)


@router.get("/{tables_id}")
def get_tables(tables_id: UUID, db: Session = Depends(get_db)):
    return get_table(db, tables_id)


@router.post("/")
def create_tables(request: CreateTables, db: Session = Depends(get_db)):
    return create_table(db, request)


@router.put("/{tables_id}")
def update_tables(
    tables_id: UUID, request: UpdateTables, response: Response, db: Session = Depends(get_db)
):
    return update_table(db, tables_id, request, response)


@router.delete("/{tables_id}")
def delete_tables(tables_id: UUID, db: Session = Depends(get_db)):
    return crud.tables.remove(db, id=tables_id)


@router.get("/schema/{tables_id}")
def get_table_schema(tables_id: UUID, db: Session = Depends(get_db)):
    return get_table_row(db, tables_id)


@router.post("/query")
def get_table_req(request: QueryTable, response: Response, db: Session = Depends(get_db)):
    return get_table_data(db, request, response)


@router.post("/convert")
def convert_to_smart_req(request: ConvertToSmart, db: Session = Depends(get_db)):
    return convert_to_smart_table(db, request)


@router.post("/pin_filters")
def pin_filters_req(request: PinFilters, db: Session = Depends(get_db)):
    return pin_filters(db, request)
