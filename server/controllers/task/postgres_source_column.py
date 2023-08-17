from sqlalchemy import engine, text


def get_pg_column_model(user_db_engine: engine, schema: str, table: str):
    sql = f"""SELECT
    columns.column_name AS name,
    columns.data_type AS type,
    column_default as default,
    CASE
        WHEN columns.is_nullable = 'YES' THEN TRUE
        ELSE FALSE
    END AS nullable,
    CASE
        WHEN primary_keys.column_name IS NOT NULL THEN TRUE
        ELSE FALSE
    END AS primary_key,
    CASE
        WHEN foreign_keys.column_name IS NOT NULL THEN TRUE
        ELSE FALSE
    END AS foreign_key,
    CASE
        WHEN uniqueness.uniqueness IS NOT NULL THEN TRUE
        ELSE FALSE
    END AS unique
    FROM
    information_schema.columns
    LEFT JOIN
    information_schema.key_column_usage AS primary_keys ON
        columns.table_schema = primary_keys.table_schema AND
        columns.table_name = primary_keys.table_name AND
        columns.column_name = primary_keys.column_name AND
        primary_keys.constraint_name = (
            SELECT
                constraint_name
            FROM
                information_schema.table_constraints
            WHERE
                table_schema = columns.table_schema AND
                table_name = columns.table_name AND
                constraint_type = 'PRIMARY KEY'
        )
    LEFT JOIN
    information_schema.key_column_usage AS foreign_keys ON
        columns.table_schema = foreign_keys.table_schema AND
        columns.table_name = foreign_keys.table_name AND
        columns.column_name = foreign_keys.column_name AND
        foreign_keys.position_in_unique_constraint IS NOT NULL
    LEFT JOIN (
    SELECT
        pg_attribute.attname AS column_name,
        pg_class.relname AS table_name,
        pg_namespace.nspname AS schema,
        'unique' AS uniqueness
    FROM
        pg_index,
        pg_class,
        pg_attribute,
        pg_namespace
    WHERE
        pg_class.oid = pg_index.indrelid
        AND pg_attribute.attrelid = pg_class.oid
        AND pg_attribute.attnum = ANY(pg_index.indkey)
        AND not pg_index.indisunique
        AND pg_namespace.oid = pg_class.relnamespace
    ) as uniqueness on
    columns.table_schema = uniqueness.schema AND
    columns.table_name = uniqueness.table_name AND
    columns.column_name = uniqueness.column_name
    WHERE
    columns.table_name = '{table}'
    AND columns.table_schema = '{schema}';
    """
    with user_db_engine.connect().execution_options(autocommit=True) as conn:
        return conn.execute(text(sql)).all()
