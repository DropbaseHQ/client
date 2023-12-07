from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from server import crud
from server.schemas.files import CreateFiles, RenameFile, UpdateFiles, UpdateFilesRequest
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db

files_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.FILES)
router = APIRouter(
    prefix="/files",
    tags=["files"],
    # dependencies=[Depends(files_authorizer)],
)


@router.post("/")
def create_file(request: CreateFiles, response: Response, db: Session = Depends(get_db)):
    try:
        return crud.files.create(db, obj_in=request)
    except Exception as e:
        response.status_code = 400
        return {"message": str(e)}


@router.put("/rename")
def update_name(request: RenameFile, db: Session = Depends(get_db)):
    file = crud.files.get_page_file_by_name(db, page_id=request.page_id, file_name=request.old_name)
    file.name = request.new_name
    db.commit()
    return file


@router.put("/source")
def update_source(request: CreateFiles, db: Session = Depends(get_db)):
    file = crud.files.get_page_file_by_name(db, page_id=request.page_id, file_name=request.name)
    file.source = request.source
    db.commit()
    return file


@router.put("/{file_id}")
def update_file_request(file_id: UUID, request: UpdateFilesRequest, db: Session = Depends(get_db)):
    if request.depends_on and len(request.depends_on) > 0:
        tables = crud.tables.get_tables_by_file(db, file_id=request.file_id)
        for table in tables:
            table.depends_on = request.depends_on
            db.commit()

    update_obj = UpdateFiles(name=request.name, source=request.source)

    return crud.files.update_by_pk(db, pk=file_id, obj_in=update_obj)


@router.delete("/{file_id}")
def delete_components(file_id: UUID, response: Response, db: Session = Depends(get_db)):
    try:
        return crud.files.remove(db, id=file_id)
    except Exception as e:
        response.status_code = 400
        return {"message": str(e)}
