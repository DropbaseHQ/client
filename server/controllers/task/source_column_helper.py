from server.controllers.task.base_source_column import SourceColumn


def update_column_meta_with_filters(column_model: SourceColumn, filters: list):
    for filter in filters:
        if filter == "_protected":
            column_model.editable = False
        elif filter == "_hidden":
            column_model.hidden = True
    return column_model


from sqlalchemy import create_engine


def connect_to_user_db():
    # NOTE: faking connect to user db
    POSTGRES_DB_HOST = "dropbase-dev.cvprjrvvsnqi.us-east-1.rds.amazonaws.com"
    POSTGRES_DB_NAME = "replica"
    POSTGRES_DB_USER = "dropbase"
    POSTGRES_DB_PASS = "cXhw9DyumxDoIsh4PQ6z"
    POSTGRES_DB_PORT = 5432

    SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg2://{POSTGRES_DB_USER}:{POSTGRES_DB_PASS}@{POSTGRES_DB_HOST}:{POSTGRES_DB_PORT}/{POSTGRES_DB_NAME}"
    return create_engine(SQLALCHEMY_DATABASE_URL)
