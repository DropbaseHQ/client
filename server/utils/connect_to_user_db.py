from sqlalchemy import create_engine


def connect_to_user_db():
    # NOTE: faking connect to user db
    POSTGRES_DB_HOST = "dropbase-dev.cvprjrvvsnqi.us-east-1.rds.amazonaws.com"
    POSTGRES_DB_NAME = "replica"
    POSTGRES_DB_USER = "dropbase"
    POSTGRES_DB_PASS = "cXhw9DyumxDoIsh4PQ6z"
    POSTGRES_DB_PORT = 5432

    SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg2://{POSTGRES_DB_USER}:{POSTGRES_DB_PASS}@{POSTGRES_DB_HOST}:{POSTGRES_DB_PORT}/{POSTGRES_DB_NAME}"
    return create_engine(SQLALCHEMY_DATABASE_URL, future=True)
