from sqlalchemy.engine import URL, Connection, create_engine
from sqlalchemy.orm import Session

SchemaDict = dict[str, dict[str, list[str]]]


def parse_object_alias(obj: str) -> tuple[str, list[str]]:
    """
    Return (schema.table.column, [properties]).
    :raises ValueError if the object does not have a schema, table, or column.
    """
    try:
        schema, table, column, *props = obj.split(".")
    except ValueError:
        raise ValueError(f"Object {obj} does not have a schema, table, or column.")

    return f"{schema}.{table}.{column}", props


def get_missing_aliases(conn: Connection, query: str, schema_dict: SchemaDict) -> list[str]:
    """
    Returns a list of aliases that are not recognised from the schema
    """
    open_query = query.rstrip(";\n ")
    res = conn.execute(f"SELECT * FROM ({open_query}) AS q LIMIT 1")
    returned_query_keys = res.keys()

    all_schema_cols: set[str] = set()
    for schema, tables in schema_dict.items():
        for table, columns in tables.items():
            for column in columns:
                all_schema_cols.add(f"{schema}.{table}.{column}")

    bad_cols = [
        key
        for key in returned_query_keys
        if parse_object_alias(key)[0] not in all_schema_cols
    ]
    return bad_cols


def get_bad_aliases(conn: Connection, query: str, used_aliases: list[str]) -> list[str]:
    """
    Returns a list of aliases that are incorrectly mapped
    :raises ValueError if the query is missing a key to perform joins on
    (either no fields are marked as `._key` or no fields are `.id`)
    """

    parsed_aliases = [parse_object_alias(alias) for alias in used_aliases]
    used_tables = [
        alias[: alias.rfind(".")] for alias, _ in parsed_aliases
    ]

    table_to_primary_key: dict[str, str] = {}

    for alias, props in parsed_aliases:
        if "_key" in props:
            table = alias[: alias.rfind(".")]
            if table in table_to_primary_key:
                raise ValueError(
                    f"Table {table} has multiple fields marked as `_key`."
                )
            table_to_primary_key[table] = alias
    
    for table in used_tables:
        if table not in table_to_primary_key:
            raise ValueError(
                f"Table {table} has no fields marked as `_key`."
            )

    # get q."public.customers.id" = public.customers.id
    alias_comparisons = [
        f'ALL(q."{alias}" = {alias}) AS "{alias}"' for alias in parsed_aliases
    ]

    joins = [
        f'JOIN {table} ON q."{table_to_primary_key[table]}" = {table_to_primary_key[table]}'
    ]

    # fancy joins here
    # backslashes are not allowed in f-strings
    alias_separator = ",\n"
    open_query = query.rstrip(";\n ")
    # TODO: add limit to open query
    checker_query = f"""
    SELECT
        {alias_separator.join(alias_comparisons)}
    FROM (
        {open_query}
    ) AS q
    {alias_separator.join(joins)}
    LIMIT 100;
    """

    res = conn.execute(checker_query)

    # check that all aliases in the result 
    bad_cols = [
        key
        for key, value in res.fetchone().items()
        if not value 
    ]
    return bad_cols

def test_sql(db: Session, url: URL, sql_string: str):
    schema = get_app_schema()
    engine = create_engine(url)
    try:
        with engine.connect() as conn:
            bad_cols = get_missing_aliases(conn, sql_string, schema)
            if bad_cols:
                raise ValueError(f"Query has unknown columns: {', '.join(bad_cols)}")
            
            bad_cols = get_bad_aliases(conn, sql_string, schema)
            if bad_cols:
                raise ValueError(f"Query has misnamed columns: {', '.join(bad_cols)}")
            

    finally:
        engine.dispose()
    ...
    # get creds from db, connect to it
    # get schema from db