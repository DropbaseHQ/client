from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from server.credentials import (
    POSTGRES_DB_HOST,
    POSTGRES_DB_NAME,
    POSTGRES_DB_PASS,
    POSTGRES_DB_PORT,
    POSTGRES_DB_USER,
    TRY_DROPBASE_DB_NAME,
)

SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg2://{POSTGRES_DB_USER}:{POSTGRES_DB_PASS}@{POSTGRES_DB_HOST}:{POSTGRES_DB_PORT}/{POSTGRES_DB_NAME}"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


TRY_DROPBASE_DATABASE_URL = f"postgresql+psycopg2://{POSTGRES_DB_USER}:{POSTGRES_DB_PASS}@{POSTGRES_DB_HOST}:{POSTGRES_DB_PORT}/{TRY_DROPBASE_DB_NAME}"
try_engine = create_engine(TRY_DROPBASE_DATABASE_URL)
