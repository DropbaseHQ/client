from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import MetaData, create_engine
from uuid import UUID
from server import crud
from server.credentials import (
    POSTGRES_DB_HOST,
    POSTGRES_DB_NAME,
    POSTGRES_DB_PASS,
    POSTGRES_DB_PORT,
    POSTGRES_DB_USER,
)


def get_app_context(db: Session, app_id: UUID):
    target_app = crud.app.get_object_by_id_or_404(db, id=app_id)
    app_owner = crud.workspace.get_workspace_owner(db, target_app.workspace_id)
    sources = crud.source.get_workspace_sources(db, target_app.workspace_id)
    response = {
        "user_info": {
            "id": app_owner.id,
            "email": app_owner.email,
            "name": app_owner.name,
            "role": app_owner.role,
        },
        "sources": sources,
        "db_engine": [],
    }
    return response


def get_postgres_tables(db: Session, app_id: UUID):
    connection_str = f"postgresql+psycopg2://{POSTGRES_DB_USER}:{POSTGRES_DB_PASS}@{POSTGRES_DB_HOST}:{POSTGRES_DB_PORT}/{POSTGRES_DB_NAME}"
    engine = create_engine(connection_str)
    GetSession = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    metadata_obj = MetaData()

    metadata_obj.reflect(bind=engine)
