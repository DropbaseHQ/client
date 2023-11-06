from fastapi import APIRouter, Depends, Response
from server import crud
from sqlalchemy.orm import Session
from server.utils.connect import get_db
from server.controllers.columns import update_table_columns

from server.schemas.tables import (
    CreateTables,
    UpdateTables,
    UpdateTablesRequest,
)
from uuid import UUID
from server.utils.state_context import get_state_context_payload

router = APIRouter(prefix="/table", tags=["table"])


@router.post("/")
def create_table(request: CreateTables, response: Response, db: Session = Depends(get_db)):
    # create table
    crud.tables.create(db, obj_in=CreateTables(**request.dict()))
    db.commit()
    return get_state_context_payload(db, request.page_id)


@router.put("/")
def update_table(request: UpdateTablesRequest, response: Response, db: Session = Depends(get_db)):
    # update table
    table_updates = UpdateTables(**request.dict())
    table = crud.tables.update_by_pk(db, pk=request.table_id, obj_in=table_updates)
    file = crud.files.get_object_by_id_or_404(db, id=request.file_id)
    # update columns
    if request.table_columns is not None and len(request.table_columns) > 0:
        update_table_columns(db, table, request.table_columns, file.type)

    db.commit()
    return get_state_context_payload(db, request.page_id)


@router.put("/properpy/{table_id}/")
def update_table_property(table_id: UUID, request: UpdateTablesRequest, db: Session = Depends(get_db)):
    return crud.tables.update_by_pk(db, pk=table_id, obj_in=request)


@router.put("/columns/{table_id}/")
def update_table_columns_req(
    table_id: UUID, request: UpdateTablesRequest, db: Session = Depends(get_db)
):
    table_updates = UpdateTables(**request.dict())
    table = crud.tables.update_by_pk(db, pk=table_id, obj_in=table_updates)
    file = crud.files.get_object_by_id_or_404(db, id=request.file_id)

    # update columns
    if request.table_columns is not None and len(request.table_columns) > 0:
        update_table_columns(db, table, request.table_columns, file.type)
    db.commit()

    return get_state_context_payload(db, request.page_id)
