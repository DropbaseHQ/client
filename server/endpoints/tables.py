from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from server import crud
from server.controllers.tables import create_table, get_table, get_table_row, pin_filters, update_table

# from server.controllers.tables.convert import convert_to_smart_table
from server.schemas.tables import (
    CreateTablesRequest,
    PinFilters,
    TablesReadProperty,
    UpdateTablesRequest,
)
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db
from server.utils.converter import get_class_properties

table_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.TABLES)

router = APIRouter(
    prefix="/tables",
    tags=["tables"],
    dependencies=[Depends(table_authorizer)],
)


@router.get("/properties")
def get_table_properties_req():
    return get_class_properties(TablesReadProperty)


@router.get("/{tables_id}")
def get_tables(tables_id: UUID, db: Session = Depends(get_db)):
    return get_table(db, tables_id)


@router.post("/", dependencies=[Depends(table_authorizer.use_params(resource_type=RESOURCES.PAGE))])
def create_tables(request: CreateTablesRequest, db: Session = Depends(get_db)):
    return create_table(db, request)


@router.put("/{tables_id}")
def update_tables(
    tables_id: UUID, request: UpdateTablesRequest, response: Response, db: Session = Depends(get_db)
):
    return update_table(db, tables_id, request, response)


@router.delete("/{tables_id}")
def delete_tables(tables_id: UUID, db: Session = Depends(get_db)):
    return crud.tables.remove(db, id=tables_id)


@router.get("/schema/{tables_id}")
def get_table_schema(tables_id: UUID, db: Session = Depends(get_db)):
    return get_table_row(db, tables_id)


# @router.post("/convert")
# def convert_to_smart_req(request: ConvertToSmart, db: Session = Depends(get_db)):
#     return convert_to_smart_table(db, request)


@router.post("/pin_filters")
def pin_filters_req(request: PinFilters, db: Session = Depends(get_db)):
    return pin_filters(db, request)
