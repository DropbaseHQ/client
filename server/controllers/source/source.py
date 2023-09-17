from uuid import UUID

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import Session

from server import crud
from server.schemas.source import (
    CreateSource,
    CreateSourceRequest,
    DatabaseCredentials,
    SourceType,
    UpdateSource,
    UpdateSourceRequest,
)
from server.utils.encrypt import _decrypt_db_creds, _encrypt_creds
from server.utils.helper import raise_http_exception

SENSITIVE_FIELDS = ["password", "creds_json"]


def get_source(db: Session, source_id: UUID):
    try:
        source = crud.source.get_object_by_id_or_404(db, source_id)
    except Exception as ex:
        raise_http_exception(404, f"source {source_id} not found", ex)

    source.creds = _decrypt_db_creds(source.workspace_id, source.creds)
    # TODO: remove sensitive data from source, like password and tokens
    for key in SENSITIVE_FIELDS:
        if key in source.creds:
            source.creds[key] = None
    return source


def create_source(db: Session, request: CreateSourceRequest):
    test_source(request)
    # NOTE: will come from request
    workspace_id = request.workspace_id
    source_obj = CreateSource(
        name=request.name,
        description=request.description,
        type=request.type,
        creds=_encrypt_creds(workspace_id, dict(request.creds)),
        workspace_id=workspace_id,
    )
    return crud.source.create(db, obj_in=source_obj)


def update_source(db: Session, source_id: UUID, request: UpdateSourceRequest):
    try:
        source = crud.source.get_object_by_id_or_404(db, id=source_id)
    except Exception as ex:
        raise_http_exception(404, f"source {source_id} not found", ex)

    source.creds = _decrypt_db_creds(source.workspace_id, source.creds)
    for key in SENSITIVE_FIELDS:
        if key in request.creds and request.creds[key] == "":
            request.creds[key] = source.creds[key]

    test_source(request)
    source_obj = UpdateSource(
        name=request.name,
        description=request.description,
        type=request.type,
        creds=_encrypt_creds(source.workspace_id, request.creds),
        workspace_id=source.workspace_id,
    )
    return crud.source.update(db, db_obj=source, obj_in=source_obj)


def delete_source(db: Session, source_id: UUID):
    try:
        return crud.source.remove(db, id=source_id)
    except Exception as ex:
        raise_http_exception(404, f"source {source_id} not found", ex)


def test_source(source: CreateSourceRequest | UpdateSourceRequest):
    if source.type == SourceType.POSTGRES:
        test_source_creds_postgres(source.creds)
    else:
        # this is only thrown if we have added a source to SourceType but have
        # not added pre-creation tests to this if statement.
        raise_http_exception(501, f'Source type: "{source.type}" not implemented.')


def test_source_creds_postgres(creds: DatabaseCredentials):
    try:
        SQLALCHEMY_DATABASE_URL = URL.create(
            "postgresql",
            username=creds.username,
            password=creds.password,
            host=creds.host,
            port=creds.port,
            database=creds.database,
        )
        source_db = create_engine(SQLALCHEMY_DATABASE_URL)
        try:
            source_db.execute("SELECT 1")
        finally:
            source_db.dispose()
    except Exception as ex:
        raise_http_exception(400, "Could not connect to source", ex)
