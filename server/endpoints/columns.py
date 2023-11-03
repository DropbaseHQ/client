from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers.columns import get_table_columns_and_props
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db

col_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.COLUMNS)

router = APIRouter(
    prefix="/columns",
    tags=["columns"],
    dependencies=[
        Depends(col_authorizer),
    ],
)


@router.get("/{columns_id}")
def get_columns(columns_id: UUID, db: Session = Depends(get_db)):
    return crud.columns.get_object_by_id_or_404(db, id=columns_id)


# Shouldn't this be in the tables endpoint?
@router.get(
    "/table/{table_id}",
    dependencies=[Depends(col_authorizer.use_params(resource_type=RESOURCES.TABLE))],
)
def get_table_columns(table_id: UUID, db: Session = Depends(get_db)):
    return get_table_columns_and_props(db, table_id=table_id)


# @router.put(
#     "/table/",
#     dependencies=[Depends(col_authorizer.use_params(resource_type=RESOURCES.TABLE))],
# )
# def update_table_columns(request: UpdateColumnsRequest, db: Session = Depends(get_db)):
#     return update_table_columns_and_props(db, request)


# @router.post("/")
# def create_columns(request: CreateColumns, db: Session = Depends(get_db)):
#     return create_column(db, request)


# @router.put("/{columns_id}")
# def update_columns(columns_id: UUID, request: UpdateColumns, db: Session = Depends(get_db)):
#     return update_column(db, columns_id, request)


# @router.delete("/{columns_id}")
# def delete_columns(columns_id: UUID, db: Session = Depends(get_db)):
#     return crud.columns.remove(db, id=columns_id)


# @router.post("/sync/")
# def sync_columns_req(request: SyncColumns, db: Session = Depends(get_db)):
#     return sync_columns(db, request)
