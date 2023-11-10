from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers.columns import get_table_columns_and_props, update_column
from server.schemas.columns import UpdateColumns
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


@router.put("/{columns_id}")
def update_columns(columns_id: UUID, request: UpdateColumns, db: Session = Depends(get_db)):
    return update_column(db, columns_id, request)
