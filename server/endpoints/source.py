from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers.source import source
from server.schemas.source import CreateSourceRequest, UpdateSourceRequest
from server.utils.authorization import RESOURCES, generate_resource_dependency
from server.utils.connect import get_db

authorize_source_actions = generate_resource_dependency(RESOURCES.SOURCE)
authorize_components_actions = generate_resource_dependency(RESOURCES.COMPONENTS)
router = APIRouter(
    prefix="/source",
    tags=["source"],
    dependencies=[
        Depends(authorize_source_actions),
        Depends(authorize_components_actions),
    ],
)


@router.get("/{source_id}")
def get_source(source_id: UUID, db: Session = Depends(get_db)):
    return source.get_source(db, source_id)


@router.post("/")
def create_source(request: CreateSourceRequest, db: Session = Depends(get_db)):
    return source.create_source(db, request)


@router.put("/{source_id}")
def update_source(source_id: UUID, request: UpdateSourceRequest, db: Session = Depends(get_db)):
    return source.update_source(db, source_id, request)


@router.delete("/{source_id}")
def delete_source(source_id: UUID, db: Session = Depends(get_db)):
    return source.delete_source(db, source_id)


@router.get("/workspace/{workspace_id}")
def get_workspace_sources(workspace_id: UUID, db: Session = Depends(get_db)):
    return crud.source.get_workspace_sources(db, workspace_id=workspace_id)
