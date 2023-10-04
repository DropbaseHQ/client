from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers.source import source
from server.schemas.source import CreateSourceRequest, UpdateSourceRequest, DatabaseCredentials
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db

source_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.SOURCE)

router = APIRouter(
    prefix="/source",
    tags=["source"],
    dependencies=[Depends(source_authorizer)],
)


@router.get("/{source_id}")
def get_source(source_id: UUID, db: Session = Depends(get_db)):
    return source.get_source(db, source_id)


@router.post(
    "/", dependencies=[Depends(source_authorizer.use_params(resource_type=RESOURCES.WORKSPACE))]
)
def create_source(request: CreateSourceRequest, db: Session = Depends(get_db)):
    return source.create_source(db, request)


@router.put("/{source_id}")
def update_source(source_id: UUID, request: UpdateSourceRequest, db: Session = Depends(get_db)):
    return source.update_source(db, source_id, request)


@router.delete("/{source_id}")
def delete_source(source_id: UUID, db: Session = Depends(get_db)):
    return source.delete_source(db, source_id)


@router.post("/test")
def test_source(request: DatabaseCredentials, db: Session = Depends(get_db)):
    # TODO implement for non-postgres sources in the future
    return source.test_source_creds_postgres(request)


@router.get(
    "/workspace/{workspace_id}",
    dependencies=[Depends(source_authorizer.use_params(resource_type=RESOURCES.WORKSPACE))],
)
def get_workspace_sources(workspace_id: UUID, db: Session = Depends(get_db)):
    return crud.source.get_workspace_sources(db, workspace_id=workspace_id)
