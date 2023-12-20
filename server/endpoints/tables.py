from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.controllers.tables import (
    get_table,
    get_table_row,
    pin_filters,
    reorder_tables as c_reorder_tables,
)
from server.schemas.tables import PinFilters, TablesReadProperty, ReorderTablesRequest

from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db
from server.utils.converter import get_class_properties

table_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.TABLES)

router = APIRouter(
    prefix="/tables",
    tags=["tables"],
    dependencies=[Depends(table_authorizer)],
)

router = APIRouter(prefix="/tables", tags=["tables"])


# client
@router.get("/properties")
def get_table_properties_req():
    return get_class_properties(TablesReadProperty)


@router.get("/{tables_id}")
def get_tables(tables_id: UUID, db: Session = Depends(get_db)):
    return get_table(db, tables_id)


@router.get("/schema/{tables_id}")
def get_table_schema(tables_id: UUID, db: Session = Depends(get_db)):
    return get_table_row(db, tables_id)


@router.post("/pin_filters")
def pin_filters_req(request: PinFilters, db: Session = Depends(get_db)):
    return pin_filters(db, request)


@router.post("/reorder")
def reorder_tables(request: ReorderTablesRequest, db: Session = Depends(get_db)):
    return c_reorder_tables(db, request)
