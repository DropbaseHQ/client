from sqlalchemy import text
from sqlalchemy.engine import Connection
from sqlalchemy.exc import ProgrammingError
from sqlalchemy.orm import Session

from server.controllers.page import PageSchema, get_db_schema
from server.controllers.task.source_column_helper import connect_to_user_db
from server.controllers.task.source_column_model import col_names_list_to_dict_schema, get_parsed_schema
from server.schemas.errors import LanguageErrorResponse
from server.utils.helper import raise_language_exception

SchemaDict = dict[str, dict[str, list[str]]]


def is_table_in_default_schema(schema_dict: PageSchema, table: str) -> bool:
    default_schema = schema_dict["metadata"]["default_schema"]
    return table in schema_dict["schema"][default_schema]


def parse_object_alias(obj: str, schema_dict: PageSchema) -> tuple[str, list[str]]:
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
        else:
            raise ValueError
    except (ValueError, IndexError):
        raise ValueError(
            f'Object "{obj}" is missing a schema, table, and/or column. Is an alias missing or misnamed?'
        )

    return f"{schema}.{table}.{column}", props


def expand_schema_tree(schema_dict: PageSchema) -> set[str]:
    """
    Convert a schema tree to a list of all possible columns
    """
    all_schema_cols: set[str] = set()
    for schema, tables in schema_dict["schema"].items():
        for table, columns in tables.items():
            for column in columns:
                all_schema_cols.add(f"{schema}.{table}.{column}")
    return all_schema_cols


def compare_aliases_from_db(
    conn: Connection, query: str, schema_dict: PageSchema
) -> tuple[list[str], list[str], list[str]]:
    """
    Returns a tuple of:
    - a list of aliases that are not in the schema by their fully qualified names
    - duplicate columns
    - all aliases used in the query
    :raises ValueError if the query is invalid.
    """
    user_query_cleaned = query.strip("\n ;")
    try:
        res = conn.execute(text(f"SELECT * FROM ({user_query_cleaned}) AS q LIMIT 1"))
        returned_query_keys = list(res.keys())
        cleaned_returned_query_keys = [
            parse_object_alias(key, schema_dict)[0] for key in returned_query_keys
        ]
    except ProgrammingError as err:
        raise ValueError(
            "There seems to be an issue with the SQL statement you provided.", str(err.orig)
        )

    all_schema_cols = expand_schema_tree(schema_dict)

    bad_cols = [key for key in cleaned_returned_query_keys if key not in all_schema_cols]
    duplicate_cols = [
        key for key in cleaned_returned_query_keys if cleaned_returned_query_keys.count(key) > 1
    ]

    return bad_cols, duplicate_cols, returned_query_keys


def get_misnamed_aliases(
    conn: Connection,
    query: str,
    used_aliases: list[str],
    schema_dict: SchemaDict,
    app_schema: PageSchema,
) -> list[str]:
    """
    Returns a list of aliases that are incorrectly mapped
    :raises TypeError if a column is incorrectly mapped such that it is
    compared with another type
    """

    parsed_aliases = [(*parse_object_alias(alias, app_schema), alias) for alias in used_aliases]
    used_tables = list(set(alias[: alias.rfind(".")] for alias, _, _ in parsed_aliases))

    table_to_primary_key: dict[str, str] = {}
    table_to_primary_alias: dict[str, str] = {}

    for alias, props, response_name in parsed_aliases:
        if "_key" in props:
            table = alias[: alias.rfind(".")]
            if table in table_to_primary_key:
                raise ValueError(
                    f"Table {table} has multiple fields marked as `_key`. Please ensure that there is only one key per table."
                )
            table_to_primary_key[table] = alias
            table_to_primary_alias[table] = response_name

    for name, props, response_name in parsed_aliases:
        # infer aliases
        table = name[: name.rfind(".")]
        if table in table_to_primary_key:
            continue

        try:
            schema, table, column = parse_object_alias(name, app_schema)[0].split(".")
            col_props = schema_dict[schema][table][column]
        except KeyError:
            raise ValueError(f'"{name}" does not exist in any of your sources. Is it misnamed?')

        if not col_props["nullable"] and col_props["unique"] or col_props["primary_key"]:
            # if the column is unique and not nullable, it can be used as a key
            table_to_primary_key[table] = name
            table_to_primary_alias[table] = response_name

    alias_separator = ",\n"
    newline = "\n"
    user_query_cleaned = query.rstrip(";\n ")  # TODO: rename to user_query
    if all(table in table_to_primary_key for table in used_tables):
        # this way is significantly more performant
        # get q."public.customers.id" = public.customers.id
        alias_comparisons = [
            f'''MIN(
                CASE WHEN q."{response_name}" = {alias}
                OR (q."{response_name}" IS NULL AND {alias} IS NULL)
                THEN 1 ELSE 0 END
            ) AS "{alias}"'''
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
                {user_query_cleaned}
            ) AS p
            LIMIT 100
        ) AS q
        {newline.join(subqueries)}
        """
        print(checker_query)

        try:
            res = conn.execute(text(checker_query))
            data = res.mappings().fetchone()
        except ProgrammingError as err:
            raise TypeError(str(err.orig))

        # check that all aliases in the result
        bad_cols = [key for key, value in data.items() if not value]
    else:
        # for each table, if there is a primary key, join on that
        # otherwise, take the first column you see and join on that
        subqueries = []
        for alias, props, response_name in parsed_aliases:
            table = alias[: alias.rfind(".")]
            # find the first column in the table from used_aliases

            subqueries.append(
                f"""
                (SELECT COUNT(*) FROM (
                    SELECT DISTINCT "{response_name}" FROM q
                ) AS q2
                INNER JOIN {table} ON q2."{response_name}" = {alias}) AS "{response_name}"
                """
            )

            subqueries.append(
                f"""
                (SELECT COUNT(*) FROM (
                    SELECT DISTINCT {alias} FROM {table}
                ) as q2) AS "DROPBASE_total_{response_name}"
                """
            )
        checker_query = f"""
        WITH q AS (
            SELECT * FROM (
                {user_query_cleaned}
            ) AS p
            LIMIT 100
        )
        SELECT
            {alias_separator.join(subqueries)}
        ;
        """

        try:
            res = conn.execute(text(checker_query))
            row = res.mappings().fetchone()
        except ProgrammingError as err:
            raise TypeError(str(err.orig))

        # bad_cols = [key for key, value in row.items() if key != "total" and value != total]

        bad_cols = [
            key
            for key, value in row.items()
            if not key.startswith("DROPBASE_total_") and value != row[f"DROPBASE_total_{key}"]
        ]

    return bad_cols


def test_sql(db: Session, engine, sql_string: str):
    """
    Tests if a SQL query is valid for the given app.
    : raises ValueError if the query is invalid.
    """
    # TODO: store schema in db
    # TODO: refactor this
    # engine = connect_to_user_db()
    db_schema = get_db_schema(engine)

    try:
        with engine.connect() as conn:
            bad_cols, duplicate_cols, good_cols = compare_aliases_from_db(conn, sql_string, db_schema)
        if bad_cols:
            raise ValueError(f"Query has unknown columns: {', '.join(bad_cols)}")
        elif duplicate_cols:
            raise ValueError(f"Query has duplicate columns: {', '.join(set(duplicate_cols))}")

        qualified_good_cols: list[str] = []
        for col in good_cols:
            alias, props = parse_object_alias(col, db_schema)
            qualified_good_cols.append(".".join([alias, *props]))

        # this function creates a new engine connection so we have to
        # get rid of the old one
        schema_dict, colnames = col_names_list_to_dict_schema(qualified_good_cols)
        parsed_schema = get_parsed_schema(engine, schema_dict)

        with engine.connect() as conn:
            try:
                bad_cols = get_misnamed_aliases(conn, sql_string, good_cols, parsed_schema, db_schema)
            except TypeError as err:
                print(err)
                raise ValueError(
                    "Query has misnamed columns. Please check "
                    "that your aliases match the returned columns.",
                    str(err),
                )
            if bad_cols:
                raise ValueError(f"Query has misnamed columns: {', '.join(bad_cols)}")

    except ValueError as err:
        message: str = err.args[0]
        details: str | None = err.args[1] if len(err.args) > 1 else None
        return raise_language_exception(
            LanguageErrorResponse(
                status="error",
                type="sql",
                message=message,
                details=details,
            )
        )
    finally:
        engine.dispose()
