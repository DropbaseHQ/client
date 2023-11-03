from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.schemas.files import CreateFiles, RenameFile, UpdateFiles
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db

# files_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.FILES)
# router = APIRouter(prefix="/files", tags=["files"], dependencies=[Depends(files_authorizer)])

router = APIRouter(prefix="/files", tags=["files"])


# client
@router.get("/{page_id}")
def get_page_files(page_id: UUID, db: Session = Depends(get_db)):
    return crud.files.get_page_files(db, page_id=page_id)


@router.get("/data_fetchers/{page_id}/")
def get_page_data_fetchers(page_id: UUID, db: Session = Depends(get_db)):
    return crud.files.get_page_data_fetchers(db, page_id=page_id)


# worker
@router.post("/")
def create_file(request: CreateFiles, db: Session = Depends(get_db)):
    return crud.files.create(db, obj_in=request)


@router.put("/{file_id}")
def update_file__request(file_id: UUID, request: UpdateFiles, db: Session = Depends(get_db)):
    return crud.files.update_by_pk(db, pk=file_id, obj_in=request)


@router.put("/source")
def update_source(request: CreateFiles, db: Session = Depends(get_db)):
    file = crud.files.get_page_file_by_name(db, page_id=request.page_id, file_name=request.name)
    file.source = request.source
    db.commit()
    return file


@router.put("/rename")
def update_name(request: RenameFile, db: Session = Depends(get_db)):
    file = crud.files.get_page_file_by_name(db, page_id=request.page_id, file_name=request.old_name)
    file.name = request.new_name
    db.commit()
    return file


@router.delete("/{file_id}")
def delete_components(file_id: UUID, db: Session = Depends(get_db)):
    return crud.files.remove(db, id=file_id)
