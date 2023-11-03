from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from server import crud
from server.controllers.columns import update_table_columns
from server.controllers.tables import get_table, get_table_row, pin_filters
from server.schemas.tables import (
    CreateTables,
    PinFilters,
    TablesReadProperty,
    UpdateTables,
    UpdateTablesRequest,
)
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db
from server.utils.converter import get_class_properties

# table_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.TABLES)

# router = APIRouter(
#     prefix="/tables",
#     tags=["tables"],
#     dependencies=[Depends(table_authorizer)],
# )

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


# worker
from server.utils.state_context import get_state_context_payload


@router.post("/")
def create_tables(request: CreateTables, db: Session = Depends(get_db)):
    crud.tables.create(db, obj_in=CreateTables(**request.dict()))
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


@router.delete("/{tables_id}")
def delete_tables(tables_id: UUID, db: Session = Depends(get_db)):
    return crud.tables.remove(db, id=tables_id)
