from sqlalchemy.orm import Session
from sqlalchemy import text

#from server.schemas.columns import PgColumnBaseProperty

# TODO delete me
from pydantic import BaseModel
from typing import Optional, Literal
class PgColumnBaseProperty(BaseModel):
    name: str
    type: Optional[
        Literal[
            "TEXT",
            "VARCHAR",
            "CHAR",
            "CHARACTER",
            "STRING",
            "BINARY",
            "VARBINARY",
            "INTEGER",
            "INT",
            "BIGINT",
            "SMALLINT",
            "TINYINT",
            "BYTEINT",
            "REAL",
            "FLOAT",
            "FLOAT4",
            "FLOAT8",
            "DOUBLE",
            "DOUBLE PRECISION",
            "DECIMAL",
            "NUMERIC",
            "BOOLEAN",
            "DATE",
            "TIME",
            "DATETIME",
            "TIMESTAMP",
            "TIMESTAMP_LTZ",
            "TIMESTAMP_NTZ",
            "TIMESTAMP_TZ",
            "VARIANT",
            "OBJECT",
            "ARRAY",
        ]
    ]

    schema_name: str = None
    table_name: str = None
    columns_name: str = None

    primary_key: bool = False
    foreign_key: bool = False
    default: str = None
    nullable: bool = True
    unique: bool = False
# END TODO


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
        CASE WHEN t.{column_name} = uq.{column_name} THEN 1 ELSE 0 END
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
    # Query that results in [(1,)] if valid, [(0,)] if false
    return f"""
    with uq as ({user_sql})
    select CASE WHEN count(t.{column_name}) = 0 THEN 1 ELSE 0 END
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


def validate_smart_cols(db: Session, smart_cols: dict[str, PgColumnBaseProperty], user_sql: str):
    # Will throw an exception if smart columns are found to be inconsistent with the db
    primary_keys = get_primary_keys(smart_cols)
    for col_data in smart_cols.values():
        pk = primary_keys.get(get_table_path(col_data))
        if pk:
            validation_sql = get_fast_sql(
                user_sql,
                col_data.schema_name,
                col_data.table_name,
                col_data.columns_name,
                pk.columns_name,
            )
        else:
            validation_sql = get_slow_sql(
                user_sql,
                col_data.schema_name,
                col_data.table_name,
                col_data.columns_name,
            )
        try:
            with db.connect().execution_options(autocommit=True) as conn:
                # On SQL programming error, we know that the smart cols are invalid,
                # no need to catch them
                res = conn.execute(text(validation_sql)).all()
            print(validation_sql)
            print(res)
            print()
            if not res[0][0]:
                raise SmartColumnDataInconsistentException
        except Exception:
            raise SmartColumnDataInconsistentException

# TODO delete me
if __name__ == "__main__":
    from sqlalchemy import create_engine, inspect
    def connect_to_user_db():
        # NOTE: faking connect to user db
        POSTGRES_DB_HOST = "dropbase-dev.cvprjrvvsnqi.us-east-1.rds.amazonaws.com"
        POSTGRES_DB_NAME = "replica"
        POSTGRES_DB_USER = "dropbase"
        POSTGRES_DB_PASS = "cXhw9DyumxDoIsh4PQ6z"
        POSTGRES_DB_PORT = 5432

        SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg2://{POSTGRES_DB_USER}:{POSTGRES_DB_PASS}@{POSTGRES_DB_HOST}:{POSTGRES_DB_PORT}/{POSTGRES_DB_NAME}"
        return create_engine(SQLALCHEMY_DATABASE_URL, future=True)
    def get_db_schema(user_db_engine):
        inspector = inspect(user_db_engine)
        schemas = inspector.get_schema_names()
        default_search_path = inspector.default_schema_name

        db_schema = {}
        gpt_schema = {
            "metadata": {
                "default_schema": default_search_path,
            },
            "schema": {},
        }

        for schema in schemas:
            if schema == "information_schema":
                continue
            tables = inspector.get_table_names(schema=schema)
            gpt_schema["schema"][schema] = {}
            db_schema[schema] = {}

            for table_name in tables:
                columns = inspector.get_columns(table_name, schema=schema)
                primary_key = set().union(inspector.get_pk_constraint(table_name, schema=schema)["constrained_columns"])

                foreign_keys = set()
                for fk_constraint in inspector.get_foreign_keys(table_name, schema=schema):
                    fk_constraint_cols = fk_constraint["constrained_columns"]
                    foreign_keys = foreign_keys.union(fk_constraint_cols)

                unique_cols = set()
                for unique_constraint in inspector.get_unique_constraints(table_name, schema=schema):
                    unique_constraint_cols = unique_constraint["column_names"]
                    unique_cols = unique_cols.union(unique_constraint_cols)

                db_schema[schema][table_name] = {}
                for column in columns:
                    col_name = column["name"]
                    is_pk = col_name in primary_key
                    db_schema[schema][table_name][col_name] = {}
                    db_schema[schema][table_name][col_name]["type"] = str(column["type"])
                    db_schema[schema][table_name][col_name]["nullable"] = column["nullable"]
                    db_schema[schema][table_name][col_name]["unique"] = is_pk or col_name in unique_cols
                    db_schema[schema][table_name][col_name]["primary_key"] = is_pk
                    db_schema[schema][table_name][col_name]["foreign_key"] = col_name in foreign_keys
                    db_schema[schema][table_name][col_name]["default"] = column["default"]
                gpt_schema["schema"][schema][table_name] = [column["name"] for column in columns]
        return db_schema, gpt_schema
    def fill_smart_cols_data(
        smart_col_paths: dict,
        db_schema
    ) -> dict[str, PgColumnBaseProperty]:
        smart_cols_data = {}
        for name, col_path in smart_col_paths.items():
            # TODO update gpt prompt to output key names that are
            #      consistent with PgColumnBaseProperty
            #      (i.e. gpt should spit out "schema_name" instead of "name")
            col_path = {
                "name": col_path["name"],
                "schema_name": col_path["schema"],
                "table_name": col_path["table"],
                "columns_name": col_path["column"],
            }

            schema = col_path["schema_name"]
            table = col_path["table_name"]
            column = col_path["columns_name"]

            try:
                col_schema_data = db_schema[schema][table][column]
            except KeyError:
                # Skip ChatGPT "hallucinated" columns
                continue

            smart_cols_data[name] = PgColumnBaseProperty(**{**col_path, **col_schema_data})
        return smart_cols_data

    db = connect_to_user_db()
    db_schema, _ = get_db_schema(db)

    smart_col_paths = {
        "c.id": {
            "name": "c.id",
            "schema": "public",
            "table": "customer",
            "column": "id"
        },
        "c.age": {
            "name": "c.age",
            "schema": "public",
            "table": "customer",
            "column": "age"
        },
        "c.name": {
            "name": "c.name",
            "schema": "public",
            "table": "customer",
            "column": "name"
        }
    }
    smart_cols = fill_smart_cols_data(smart_col_paths, db_schema)
    user_sql = "select c.id, c.age, c.name from public.customer c"
    validate_smart_cols(db, smart_cols, user_sql)
# END TODO
