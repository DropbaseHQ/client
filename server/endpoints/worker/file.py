from fastapi import APIRouter, Depends
from server import crud
from sqlalchemy.orm import Session
from server.schemas.files import CreateFiles, UpdateFiles
from server.utils.connect import get_db
from uuid import UUID

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/")
def create_file(request: CreateFiles, db: Session = Depends(get_db)):
    return crud.files.create(db, obj_in=request)


@router.put("/{file_id}")
def update_file__request(file_id: UUID, request: UpdateFiles, db: Session = Depends(get_db)):
    return crud.files.update_by_pk(db, pk=file_id, obj_in=request)


@router.delete("/{file_id}")
def delete_components(file_id: UUID, db: Session = Depends(get_db)):
    return crud.files.remove(db, id=file_id)
