from uuid import UUID

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import Session

from server import crud
from server.schemas import SourceType, CreateSource, CreateSourceRequest, UpdateSource, UpdateSourceRequest
from server.utils.encrypt import _decrypt_db_creds, _encrypt_creds
from server.utils.helper import raise_http_exception

# TODO remove me
HARDCODED_WORKSPACE_ID = "6db13881-1ba4-4412-9ae7-a21fb0e52d2d"
SENSITIVE_FIELDS = ["password", "creds_json"]


def get_source(db: Session, source_id: UUID):
    try:
        source = crud.source.get_object_by_id_or_404(db, source_id)
        source.creds = _decrypt_db_creds(HARDCODED_WORKSPACE_ID, source.creds)
        # TODO: remove sensitive data from source, like password and tokens
        for key in SENSITIVE_FIELDS:
            if key in source.creds:
                source.creds[key] = None
        return source
    except Exception as ex:
        raise_http_exception(404, f"source {source_id} not found", ex)


def create_source(db: Session, request: CreateSourceRequest):
    test_source(request)
    source_obj = CreateSource(
        name=request.name,
        description=request.description,
        type=request.type,
        creds=_encrypt_creds(HARDCODED_WORKSPACE_ID, dict(request.creds)),
        workspace_id=HARDCODED_WORKSPACE_ID,
    )
    return crud.source.create(db, obj_in=source_obj)


def update_source(db: Session, source_id: UUID, request: UpdateSourceRequest):
    try:
        source = crud.source.get_object_by_id_or_404(db, id=source_id)
        source.creds = _decrypt_db_creds(HARDCODED_WORKSPACE_ID, source.creds)

        for key in SENSITIVE_FIELDS:
            if key in request.creds and request.creds[key] == "":
                request.creds[key] = source.creds[key]

        source_obj = UpdateSource(
            name=request.name,
            description=request.description,
            type=request.type,
            creds=_encrypt_creds(HARDCODED_WORKSPACE_ID, request.creds),
            workspace_id=HARDCODED_WORKSPACE_ID,
        )
        return crud.source.update(db, db_obj=source, obj_in=source_obj)
    except Exception as ex:
        raise_http_exception(404, f"source {source_id} not found", ex)


def delete_source(db: Session, source_id: UUID):
    try:
        return crud.source.remove(db, id=source_id)
    except Exception as ex:
        raise_http_exception(404, f"source {source_id} not found", ex)


def test_source(source: CreateSourceRequest):
    if source.type == SourceType.POSTGRES:
        test_source_creds_postgres(source)
    else:
        # this is only thrown if we have added a source to SourceType but have
        # not added pre-creation tests to this if statement.
        raise_http_exception(501, f"Source type: \"{source.type}\" not implemented.")


def test_source_creds_postgres(source: CreateSourceRequest):
    try:
        SQLALCHEMY_DATABASE_URL = URL.create(
            "postgresql",
            username=source.creds.username,
            password=source.creds.password,
            host=source.creds.host,
            port=source.creds.port,
            database=source.creds.database,
        )
        source_db = create_engine(SQLALCHEMY_DATABASE_URL)
        try:
            source_db.execute("SELECT 1")
        finally:
            source_db.dispose()
    except Exception as ex:
        raise_http_exception(400, "Could not connect to source", ex)
