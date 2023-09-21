from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers.columns import create_column, get_table_columns_and_props, update_column
from server.schemas.columns import CreateColumns, UpdateColumns
from server.utils.authorization import RESOURCES, generate_resource_dependency
from server.utils.connect import get_db

authorize_columns_actions = generate_resource_dependency(RESOURCES.COLUMNS)
authorize_tables_actions = generate_resource_dependency(RESOURCES.TABLE)
authorize_components_actions = generate_resource_dependency(RESOURCES.COMPONENTS)


router = APIRouter(
    prefix="/columns",
    tags=["columns"],
    dependencies=[
        Depends(authorize_columns_actions),
        Depends(authorize_tables_actions),
        Depends(authorize_components_actions),
    ],
)


@router.get("/{columns_id}")
def get_columns(columns_id: UUID, db: Session = Depends(get_db)):
    return crud.columns.get_object_by_id_or_404(db, id=columns_id)


@router.get("/table/{table_id}")
def get_table_columns(table_id: UUID, db: Session = Depends(get_db)):
    return get_table_columns_and_props(db, table_id=table_id)


authorize_columns_creation = generate_resource_dependency(RESOURCES.TABLE, is_on_resource_creation=True)


@router.post("/", dependencies=[Depends(authorize_columns_creation)])
def create_columns(request: CreateColumns, db: Session = Depends(get_db)):
    return create_column(db, request)


@router.put("/{columns_id}")
def update_columns(columns_id: UUID, request: UpdateColumns, db: Session = Depends(get_db)):
    return update_column(db, columns_id, request)


@router.delete("/{columns_id}")
def delete_columns(columns_id: UUID, db: Session = Depends(get_db)):
    return crud.columns.remove(db, id=columns_id)
