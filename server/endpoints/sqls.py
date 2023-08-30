from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers.sqls import create_sql, update_sql
from server.schemas.sqls import CreateSQLs, UpdateSQLs
from server.utils.connect import get_db
from server.utils.authorization import generate_resource_dependency, RESOURCES

authorize_sqls_actions = generate_resource_dependency(RESOURCES.SQLS)
router = APIRouter(prefix="/sqls", tags=["sqls"], dependencies=[Depends(authorize_sqls_actions)])


@router.get("/{sqls_id}")
def get_sqls(sqls_id: UUID, db: Session = Depends(get_db)):
    return crud.sqls.get_object_by_id_or_404(db, id=sqls_id)


@router.post("/")
def create_sqls(request: CreateSQLs, db: Session = Depends(get_db)):
    return create_sql(db, request)


@router.put("/{sqls_id}")
def update_sqls(sqls_id: UUID, request: UpdateSQLs, db: Session = Depends(get_db)):
    return update_sql(db, sqls_id, request)


@router.delete("/{sqls_id}")
def delete_sqls(sqls_id: UUID, db: Session = Depends(get_db)):
    return crud.sqls.remove(db, id=sqls_id)
