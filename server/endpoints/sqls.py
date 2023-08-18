from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers import sqls
from server.schemas.sqls import CreateSQLs, UpdateSQLs
from server.utils.connect import get_db

router = APIRouter(prefix="/sqls", tags=["sqls"])


@router.get("/{sqls_id}")
def get_sqls(sqls_id: UUID, db: Session = Depends(get_db)):
    return crud.sqls.get_object_by_id_or_404(db, id=sqls_id)


@router.post("/")
def create_sqls(request: CreateSQLs, db: Session = Depends(get_db)):
    sqls.test_sql(db, request.code)
    return crud.sqls.create(db, obj_in=request)


@router.put("/{sqls_id}")
def update_sqls(sqls_id: UUID, request: UpdateSQLs, db: Session = Depends(get_db)):
    if request.code:
        sqls.test_sql(db, request.code)
    return crud.sqls.update_by_pk(db=db, pk=sqls_id, obj_in=request)


@router.delete("/{sqls_id}")
def delete_sqls(sqls_id: UUID, db: Session = Depends(get_db)):
    return crud.sqls.remove(db, id=sqls_id)
