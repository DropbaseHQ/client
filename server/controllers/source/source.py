from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.models.source import SourceType
from server.schemas import CreateSource, CreateSourceRequest, UpdateSource, UpdateSourceRequest
from server.utils.encrypt import _decrypt_db_creds, _encrypt_creds
from server.utils.helper import raise_http_exception

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

    test_source(db, request, user_id=user.id)
    source_obj = CreateSource(
        name=request.name,
        description=request.description,
        type=request.type,
        creds=_encrypt_creds(user.id, dict(request.creds)),
        user_id=user.id,
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
            workspace_id=request.user_id,
        )
        return crud.source.update(db, db_obj=source, obj_in=source_obj)
    except Exception as ex:
        raise_http_exception(404, f"source {source_id} not found", ex)


def delete_source(db: Session, source_id: UUID):
    return crud.source.remove(db, id=source_id)


def test_source(
    db: Session,
    source: CreateSourceRequest | UpdateSourceRequest,
    user_email: str | None = None,
    user_id: str | None = None,
):
    try:
        if user_email is user_id is None:
            raise_http_exception(400, "Missing user")

        if user_id is None:
            user_id = crud.user.get_user_by_email(db, email=user_email).id

        if isinstance(source, CreateSourceRequest):
            pass
        else:
            if source.source_id:
                donor_source = crud.source.get_object_by_id_or_404(db, id=source.source_id)
                donor_source.creds = _decrypt_db_creds(donor_source.user_id, donor_source.creds)
                for key in SENSITIVE_FIELDS:
                    if key in source.creds and not source.creds[key]:
                        print("updated")
                        source.creds[key] = donor_source.creds[key]

    except Exception as ex:
        raise_http_exception(400, "Could not connect to source", ex)
