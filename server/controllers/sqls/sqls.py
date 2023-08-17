from sqlalchemy.engine import URL, Connection, create_engine
from sqlalchemy.exc import ProgrammingError
from sqlalchemy.orm import Session

from server import crud
from server.controllers.app import AppSchema, get_app_schema
from server.controllers.task.source_column_helper import connect_to_user_db
from server.controllers.task.source_column_model import get_parsed_schema, get_regrouped_schema
from server.utils.helper import raise_http_exception

SchemaDict = dict[str, dict[str, list[str]]]


def is_table_in_default_schema(schema_dict: AppSchema, table: str) -> bool:
    default_schema = schema_dict["metadata"]["default_schema"]
    return table in schema_dict["schema"][default_schema]


def parse_object_alias(obj: str, schema_dict: AppSchema) -> tuple[str, list[str]]:
    """
    Return (schema.table.column,  [properties]).
    :raises ValueError if the object does not have a schema, table, or column.
    """
    try:
        # PROBLEM: we don't have a way to determine if schema is missing
        # if there are also props because there's no difference
        data = obj.split(".")
        if data[0] in schema_dict["schema"] and data[1] in schema_dict["schema"][data[0]]:
            schema, table, column, *props = data
        elif is_table_in_default_schema(schema_dict, data[0]):
            schema = schema_dict["metadata"]["default_schema"]
            table, column, *props = data
    except (ValueError, IndexError):
        raise ValueError(
            f"Object {obj} is missing a schema, table, and/or column. Is an alias missing?")

    return f"{schema}.{table}.{column}", props


def lookup_alias_in_schema(app_schema: AppSchema, schema_dict: SchemaDict, alias: str) -> dict:
    """
    Return the column properties for an alias.
    :raises KeyError if the alias does not exist in the schema.
    """
    schema, table, column = parse_object_alias(
        alias, app_schema)[0].split(".")

    return schema_dict[schema][table][column]


def expand_schema_tree(schema_dict: AppSchema) -> set[str]:
    """
    Convert a schema tree to a list of all possible columns
    """
    all_schema_cols: set[str] = set()
    for schema, tables in schema_dict["schema"].items():
        for table, columns in tables.items():
            for column in columns:
                all_schema_cols.add(f"{schema}.{table}.{column}")
    return all_schema_cols


def compare_aliases_from_db(conn: Connection, query: str, schema_dict: AppSchema) -> tuple[list[str], list[str], list[str]]:
    """
    Returns a tuple of:
    - a list of aliases that are not in the schema by their fully qualified names
    - duplicate columns
    - all aliases used in the query
    :raises ValueError if the query is invalid.
    """
    open_query = query.rstrip(";\n ")
    try:
        res = conn.execute(f"SELECT * FROM ({open_query}) AS q LIMIT 1")
        returned_query_keys = list(res.keys())
    except ProgrammingError:
        raise ValueError("Query is invalid.")

    all_schema_cols = expand_schema_tree(schema_dict)

    bad_cols = [
        key
        for key in returned_query_keys
        if parse_object_alias(key, schema_dict)[0] not in all_schema_cols
    ]
    duplicate_cols = [
        key
        for key in returned_query_keys
        if returned_query_keys.count(key) > 1
    ]

    return bad_cols, duplicate_cols, returned_query_keys


def get_misnamed_aliases(conn: Connection, query: str, used_aliases: list[str], schema_dict: SchemaDict, app_schema: AppSchema) -> list[str]:
    """
    Returns a list of aliases that are incorrectly mapped
    :raises TypeError if a column is incorrectly mapped such that it is
    compared with another type
    """

    parsed_aliases = [(*parse_object_alias(
        alias, app_schema), alias) for alias in used_aliases]
    used_tables = list(set(
        alias[: alias.rfind(".")] for alias, _, _ in parsed_aliases
    ))

    table_to_primary_key: dict[str, str] = {}
    table_to_primary_alias: dict[str, str] = {}

    for alias, props, response_name in parsed_aliases:
        if "_key" in props:
            table = alias[: alias.rfind(".")]
            if table in table_to_primary_key:
                raise ValueError(
                    f"Table {table} has multiple fields marked as `_key`."
                )
            table_to_primary_key[table] = alias
            table_to_primary_alias[table] = response_name

    for name, props, response_name in parsed_aliases:
        # infer aliases
        table = name[: name.rfind(".")]
        if table in table_to_primary_key:
            continue

        col_props = lookup_alias_in_schema(app_schema, schema_dict, name)

        if not col_props["nullable"] and col_props["unique"] or col_props["primary_key"]:
            # if the column is unique and not nullable, it can be used as a key
            table_to_primary_key[table] = name
            table_to_primary_alias[table] = response_name

    alias_separator = ",\n"
    newline = "\n"
    open_query = query.rstrip(";\n ")
    if all(table in table_to_primary_key for table in used_tables):
        # this way is significantly more performant
        # get q."public.customers.id" = public.customers.id
        alias_comparisons = [
            f'MAX( CASE WHEN q."{response_name}" = {alias} THEN 1 ELSE 0 END) AS "{alias}"'
            for alias, props, response_name in parsed_aliases
        ]

        subqueries = [
            f'JOIN {table} ON q."{table_to_primary_alias[table]}" = {table_to_primary_key[table]}'
            for table in used_tables
        ]
        checker_query = f"""
        SELECT
            {alias_separator.join(alias_comparisons)}
        FROM (
            SELECT * FROM (
                {open_query}
            ) AS p
            LIMIT 100
        ) AS q
        {newline.join(subqueries)}
        """
        print(checker_query)

        res = conn.execute(checker_query)
        data = res.fetchone()

        # check that all aliases in the result
        bad_cols = [
            key
            for key, value in data.items()
            if not value
        ]
    else:
        # for each table, if there is a primary key, join on that
        # otherwise, take the first column you see and join on that
        subqueries = []
        for alias, props, response_name in parsed_aliases:
            table = alias[: alias.rfind(".")]
            if table in table_to_primary_key:
                subqueries.append(
                    f"""
                    (SELECT COUNT(*) FROM (
                        SELECT DISTINCT "{table_to_primary_alias[table]}" FROM q
                    ) AS q2
                    INNER JOIN {table} ON q2."{table_to_primary_alias[table]}" = {table_to_primary_key[table]})
                    AS "{table_to_primary_alias[table]}"
                    """
                )
            else:
                # find the first column in the table from used_aliases

                subqueries.append(
                    f"""
                    (SELECT COUNT(*) FROM (
                        SELECT DISTINCT "{response_name}" FROM q
                    ) AS q2
                    INNER JOIN {table} ON q2."{response_name}" = {alias}) AS "{response_name}"
                    """
                )
        subqueries.append('(SELECT COUNT(*) FROM q) AS "total"')
        checker_query = f"""
        WITH q AS (
            SELECT * FROM (
                {open_query}
            ) AS p
            LIMIT 100
        )
        SELECT
            {alias_separator.join(subqueries)}
        ;
        """
        print(checker_query)

        try:
            res = conn.execute(checker_query)
            row = res.fetchone()
        except ProgrammingError as err:
            print(err)
            raise TypeError(f"Query columns cannot be compared: {err}")
        total = row["total"]
        print(row)
        bad_cols = [
            key
            for key, value in row.items()
            if key != "total" and value != total
        ]

    return bad_cols


def test_sql(db: Session, sql_string: str):
    """
    Tests if a SQL query is valid for the given app.
    : raises ValueError if the query is invalid.
    """
    # app = crud.app.get_object_by_id_or_404(db, id=app_id)
    # TODO: store schema in db
    schema = get_app_schema()
    engine = connect_to_user_db()
    try:
        with engine.connect() as conn:
            bad_cols, duplicate_cols, good_cols = compare_aliases_from_db(
                conn, sql_string, schema)
            if bad_cols:
                raise ValueError(
                    f"Query has unknown columns: {', '.join(bad_cols)}")
            elif duplicate_cols:
                raise ValueError(
                    f"Query has duplicate columns: {', '.join(duplicate_cols)}")

            qualified_good_cols: list[str] = []
            for col in good_cols:
                alias, props = parse_object_alias(col, schema)
                qualified_good_cols.append(
                    ".".join([alias, *props])
                )
            regrouped_schema, colnames = get_regrouped_schema(
                qualified_good_cols)
            parsed_schema = get_parsed_schema(conn, regrouped_schema)

            try:
                bad_cols = get_misnamed_aliases(
                    conn, sql_string, good_cols, parsed_schema, schema)
            except TypeError as err:
                print(err)
                raise ValueError(
                    "Query has misnamed columns that cannot be determined. Please check "
                    "that your aliases match the returned columns.")
            if bad_cols:
                raise ValueError(
                    f"Query has misnamed columns: {', '.join(bad_cols)}")
    except ValueError as err:
        return raise_http_exception(400, str(err))
    finally:
        engine.dispose()
