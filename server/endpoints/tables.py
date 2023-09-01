from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers.tables import create_table, update_table
from server.controllers.task import table
from server.schemas.tables import CreateTables, QueryTable, UpdateTables
from server.utils.connect import get_db

router = APIRouter(prefix="/tables", tags=["tables"])


@router.get("/{tables_id}")
def get_tables(tables_id: UUID, db: Session = Depends(get_db)):
    return crud.tables.get_object_by_id_or_404(db, id=tables_id)


@router.post("/")
def create_tables(request: CreateTables, db: Session = Depends(get_db)):
    return create_table(db, request)


@router.put("/{tables_id}")
def update_tables(tables_id: UUID, request: UpdateTables, db: Session = Depends(get_db)):
    return update_table(db, tables_id, request)


@router.delete("/{tables_id}")
def delete_tables(tables_id: UUID, db: Session = Depends(get_db)):
    return crud.tables.remove(db, id=tables_id)


# @router.post("/")
# def get_table(request: QueryTable, db: Session = Depends(get_db)):
#     return table.get_table_data(db, request)
