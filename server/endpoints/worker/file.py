from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from server import crud
from server.schemas.files import CreateFiles, UpdateFiles
from server.utils.connect import get_db

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/")
def create_file(request: CreateFiles, response: Response, db: Session = Depends(get_db)):
    try:
        return crud.files.create(db, obj_in=request)
    except Exception as e:
        response.status_code = 400
        return {"message": str(e)}


@router.put("/{file_id}")
def update_file__request(file_id: UUID, request: UpdateFiles, db: Session = Depends(get_db)):
    return crud.files.update_by_pk(db, pk=file_id, obj_in=request)


@router.delete("/{file_id}")
def delete_components(file_id: UUID, db: Session = Depends(get_db)):
    return crud.files.remove(db, id=file_id)
