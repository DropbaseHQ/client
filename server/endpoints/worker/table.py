from fastapi import APIRouter, Depends, Response
from server import crud
from sqlalchemy.orm import Session
from server.utils.connect import get_db
from server.controllers import tables as table_controller
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.schemas.tables import CreateTables, UpdateTablesRequest
from uuid import UUID

table_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.TABLES)

router = APIRouter(prefix="/table", tags=["table"])


@router.post("/")
def create_table(
    request: CreateTables, response: Response, db: Session = Depends(get_db)
):
    return table_controller.create_table(db, request)


@router.put("/")
def update_table(
    request: UpdateTablesRequest, response: Response, db: Session = Depends(get_db)
):
    return table_controller.update_table(db, request)


@router.put("/properpy/{table_id}/")
def update_table_property(
    table_id: UUID, request: UpdateTablesRequest, db: Session = Depends(get_db)
):
    return crud.tables.update_by_pk(db, pk=table_id, obj_in=request)


@router.put("/columns/{table_id}/")
def update_table_columns_req(
    table_id: UUID, request: UpdateTablesRequest, db: Session = Depends(get_db)
):
    return table_controller.update_table_columns_req(db, table_id, request)


@router.delete("/{table_id}/")
def delete_table(table_id: UUID, db: Session = Depends(get_db)):
    return table_controller.delete_table(db, table_id)
