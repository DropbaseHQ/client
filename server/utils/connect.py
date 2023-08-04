from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from server.credentials import (
    POSTGRES_DB_HOST,
    POSTGRES_DB_NAME,
    POSTGRES_DB_PASS,
    POSTGRES_DB_PORT,
    POSTGRES_DB_USER,
)

connection_str = f"postgresql+psycopg2://{POSTGRES_DB_USER}:{POSTGRES_DB_PASS}@{POSTGRES_DB_HOST}:{POSTGRES_DB_PORT}/{POSTGRES_DB_NAME}"
engine = create_engine(connection_str)
GetSession = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db() -> Generator:
    try:
        db = GetSession()
        yield db
    finally:
        db.close()
