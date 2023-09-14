from typing import Optional
from uuid import UUID

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import Session

from server import crud
from server.models.source import SourceType
from server.schemas import CreateSource, CreateSourceRequest, UpdateSource, UpdateSourceRequest
from server.utils.encrypt import _decrypt_db_creds, _encrypt_creds
from server.utils.helper import raise_http_exception

# TODO remove me
HARDCODED_WORKSPACE_ID = "6db13881-1ba4-4412-9ae7-a21fb0e52d2d"
SENSITIVE_FIELDS = ["password", "creds_json"]


def get_source(db: Session, source_id: UUID):
    try:
        source = crud.source.get_object_by_id_or_404(db, source_id)
        source.creds = _decrypt_db_creds(source.user_id, source.creds)
        # TODO: remove sensitive data from source, like password and tokens
        for key in SENSITIVE_FIELDS:
            if key in source.creds:
                source.creds[key] = None
        return source
    except Exception as ex:
        raise_http_exception(404, f"source {source_id} not found", ex)


def create_source(db: Session, user_email: str, request: CreateSourceRequest):
    user = crud.user.get_user_by_email(db, email=user_email)

    test_source(db, request, user_email, user_id=user.id)
    source_obj = CreateSource(
        name=request.name,
        description=request.description,
        type=request.type,
        creds=_encrypt_creds(user.id, dict(request.creds)),
        workspace_id=HARDCODED_WORKSPACE_ID,
    )
    return crud.source.create(db, obj_in=source_obj)


def update_source(db: Session, source_id: UUID, request: UpdateSourceRequest):
    try:
        source = crud.source.get_object_by_id_or_404(db, id=source_id)
        source.creds = _decrypt_db_creds(source.user_id, source.creds)

        for key in SENSITIVE_FIELDS:
            if key in request.creds and request.creds[key] == "":
                request.creds[key] = source.creds[key]

        source_obj = UpdateSource(
            name=request.name,
            description=request.description,
            type=request.type,
            creds=_encrypt_creds(request.user_id, request.creds),
            workspace_id=HARDCODED_WORKSPACE_ID,
        )
        return crud.source.update(db, db_obj=source, obj_in=source_obj)
    except Exception as ex:
        raise_http_exception(404, f"source {source_id} not found", ex)


def delete_source(db: Session, source_id: UUID):
    return crud.source.remove(db, id=source_id)


def test_source(
    db: Session,
    source: CreateSourceRequest,
    user_email: str,
    user_id: Optional[str] = None
):
    # All we do is Given a source_id, or source_credentials
    # connect to the source
    # run "select 1"
    # Checkout dropmail for more guidance
    import pdb; pdb.set_trace()
    try:
        if user_id is None:
            user_id = crud.user.get_user_by_email(db, email=user_email).id

        # TODO abstract this out to work for multiple sources

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
