from .gpt_templates.postgres_gpt_template import get_postgres_gpt_input
from .gpt_templates.mysql_gpt_template import get_mysql_gpt_input
from .gpt_templates.snowflake_gpt_template import get_snowflake_gpt_input
from .gpt_templates.sqlite_gpt_template import get_sqlite_gpt_input

def get_gpt_input(db_schema: dict, user_sql: str, column_names: list, db_type: str) -> str:
    match db_type:
        case "postgres":
                return get_postgres_gpt_input(db_schema, user_sql, column_names)
        case "mysql":
                return get_mysql_gpt_input(db_schema, user_sql, column_names)
        case "snowflake":
                return get_snowflake_gpt_input(db_schema, user_sql, column_names)
        case "sqlite":
                return get_sqlite_gpt_input(db_schema, user_sql, column_names)
        case _:
                  return get_postgres_gpt_input(db_schema, user_sql, column_names)