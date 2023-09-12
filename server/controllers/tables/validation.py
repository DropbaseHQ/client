from sqlalchemy.orm import Session
from sqlalchemy import text

from server.schemas.columns import PgColumnBaseProperty

class SmartColumnDataInconsistentException(BaseException):
    pass


def get_fast_sql(
    user_sql: str,
    schema_name: str,
    table_name: str,
    column_name: str,
    table_pk_name: str,
) -> str:
    # Query that results in [(1,)] if valid, [(0,)] if false
    return f"""
    with uq as ({user_sql})
    select min(
        CASE WHEN
            t.{column_name} = uq.{column_name} or
            t.{column_name} is null and uq.{column_name} is null
        THEN 1 ELSE 0 END
    ) as equal
    from {schema_name}.{table_name} t
    inner join uq on t.{table_pk_name} = uq.{table_pk_name};
    """

def get_slow_sql(
    user_sql: str,
    schema_name: str,
    table_name: str,
    column_name: str,
) -> str:
    # Query that results in [(True,)] if valid, [(False,)] if false
    return f"""
    with uq as ({user_sql})
    select CASE WHEN count(t.{column_name}) = 0 THEN true ELSE false END
    from {schema_name}.{table_name} t
    where t.{column_name} not in (select uq.{column_name} from uq);
    """


def get_table_path(col_data: PgColumnBaseProperty) -> str:
    return f"{col_data.schema_name}.{col_data.table_name}"


def get_primary_keys(smart_cols: dict[str, PgColumnBaseProperty]) -> dict[str, PgColumnBaseProperty]:
    # Returns dict in the format {schema.table : pk_column_name}
    primary_keys = {}
    for col_data in smart_cols.values():
        if col_data.primary_key:
            primary_keys[get_table_path(col_data)] = col_data
    return primary_keys


def validate_smart_cols(user_db_engine, smart_cols: dict[str, PgColumnBaseProperty], user_sql: str):
    # Will delete any columns that are invalid from smart_cols
    primary_keys = get_primary_keys(smart_cols)
    for col_name, col_data in smart_cols.items():
        pk = primary_keys.get(get_table_path(col_data))
        if pk:
            validation_sql = get_fast_sql(
                user_sql,
                col_data.schema_name,
                col_data.table_name,
                col_data.column_name,
                pk.column_name,
            )
        else:
            validation_sql = get_slow_sql(
                user_sql,
                col_data.schema_name,
                col_data.table_name,
                col_data.column_name,
            )
        try:
            with user_db_engine.connect().execution_options(autocommit=True) as conn:
                # On SQL programming error, we know that the smart cols are invalid,
                # no need to catch them
                res = conn.execute(text(validation_sql)).all()
            if not res[0][0]:
                # invalid
                raise SmartColumnDataInconsistentException
        except BaseException:
            # Drop column on any exception
            del smart_cols[col_name]
            continue
