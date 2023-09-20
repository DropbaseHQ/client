from uuid import UUID

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from server import crud
from server.utils.encrypt import _decrypt_db_creds


def connect_to_user_db(db: Session, source_id: UUID):
    source = crud.source.get_object_by_id_or_404(db, id=source_id)
    creds = _decrypt_db_creds(source.workspace_id, source.creds)
    # NOTE: faking connect to user db
    POSTGRES_DB_HOST = creds.get("host")
    POSTGRES_DB_NAME = creds.get("database")
    POSTGRES_DB_USER = creds.get("username")
    POSTGRES_DB_PASS = creds.get("password")
    POSTGRES_DB_PORT = creds.get("port")

    SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg2://{POSTGRES_DB_USER}:{POSTGRES_DB_PASS}@{POSTGRES_DB_HOST}:{POSTGRES_DB_PORT}/{POSTGRES_DB_NAME}"
    return create_engine(SQLALCHEMY_DATABASE_URL, future=True)
