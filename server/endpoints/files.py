from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db

files_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.FILES)
router = APIRouter(
    prefix="/files",
    tags=["files"],
    dependencies=[Depends(files_authorizer)],
)


@router.get("/{page_id}")
def get_page_files(page_id: UUID, db: Session = Depends(get_db)):
    return crud.files.get_page_files(db, page_id=page_id)
