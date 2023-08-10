from sqlalchemy import create_engine, inspect


def get_app_schema():
    connection_str = f"postgresql+psycopg2://dropmail:dropmail@dropmail.cbwxplfobdd5.us-west-1.rds.amazonaws.com:5432/dropmail"
    engine = create_engine(connection_str)
    return get_db_schema(engine)


def get_db_schema(engine):
    inspector = inspect(engine)
    schemas = inspector.get_schema_names()

    database_structure = {}

    for schema in schemas:
        tables = inspector.get_table_names(schema=schema)
        schema_tables = {}

        for table_name in tables:
            columns = inspector.get_columns(table_name, schema=schema)
            column_names = [column["name"] for column in columns]
            schema_tables[table_name] = column_names
        database_structure[schema] = schema_tables

    return database_structure
