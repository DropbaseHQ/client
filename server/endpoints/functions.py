from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.schemas.functions import CreateFunctions, UpdateFunctions
from server.utils.connect import get_db

router = APIRouter(prefix="/functions", tags=["functions"])


@router.get("/{functions_id}")
def get_functions(functions_id: UUID, db: Session = Depends(get_db)):
    return crud.functions.get_object_by_id_or_404(db, id=functions_id)


@router.post("/")
def create_functions(request: CreateFunctions, db: Session = Depends(get_db)):
    return crud.functions.create(db, obj_in=request)


@router.put("/{functions_id}")
def update_functions(functions_id: UUID, request: UpdateFunctions, db: Session = Depends(get_db)):
    return crud.functions.update_by_pk(db=db, pk=functions_id, obj_in=request)


@router.delete("/{functions_id}")
def delete_functions(functions_id: UUID, db: Session = Depends(get_db)):
    return crud.functions.remove(db, id=functions_id)
