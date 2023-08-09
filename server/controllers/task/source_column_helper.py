def update_column_meta_with_filters(column_model, filters: list):
    for filter in filters:
        if filter == "_protected":
            column_model.editable = False
        elif filter == "_hidden":
            column_model.visible = False
    return column_model


from sqlalchemy import create_engine


def connect_to_user_db():
    print("connecting to user db")
    POSTGRES_DB_HOST = "localhost"
    POSTGRES_DB_NAME = "postgres"
    POSTGRES_DB_USER = "postgres"
    POSTGRES_DB_PASS = "postgres"
    POSTGRES_DB_PORT = 5432

    SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg2://{POSTGRES_DB_USER}:{POSTGRES_DB_PASS}@{POSTGRES_DB_HOST}:{POSTGRES_DB_PORT}/{POSTGRES_DB_NAME}"
    return create_engine(SQLALCHEMY_DATABASE_URL)
