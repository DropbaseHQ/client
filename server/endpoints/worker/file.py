from uuid import UUID

from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.orm import Session

from server import crud
from server.schemas.files import CreateFiles, UpdateFiles, RenameFile
from server.utils.connect import get_db

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/")
def create_file(
    request: CreateFiles, response: Response, db: Session = Depends(get_db)
):
    try:
        return crud.files.create(db, obj_in=request)
    except Exception as e:
        response.status_code = 400
        return {"message": str(e)}


@router.put("/rename")
def update_name(request: RenameFile, db: Session = Depends(get_db)):
    file = crud.files.get_page_file_by_name(
        db, page_id=request.page_id, file_name=request.old_name
    )
    file.name = request.new_name
    db.commit()
    return file


@router.put("/{file_id}")
def update_file_request(
    file_id: UUID, request: UpdateFiles, db: Session = Depends(get_db)
):
    return crud.files.update_by_pk(db, pk=file_id, obj_in=request)


@router.delete("/{file_id}")
def delete_components(file_id: UUID, db: Session = Depends(get_db)):
    return crud.files.remove(db, id=file_id)
