import json
from typing import Dict

import openai
from pydantic import BaseModel
from sqlalchemy.orm import Session

from server import crud
from server.constants import GPT_MODEL, GPT_TEMPERATURE
from server.controllers.task.source_column_helper import connect_to_user_db
from server.credentials import OPENAI_API_KEY, OPENAI_ORG_ID
from server.schemas.columns import PgColumnBaseProperty
from server.schemas.tables import ConvertToSmart

from .gpt_template import get_gpt_input

openai.organization = OPENAI_ORG_ID
openai.api_key = OPENAI_API_KEY

from server.controllers.tables.helper import FullDBSchema, get_column_names, get_db_schema
from server.controllers.tables.validation import validate_smart_cols


class ColumnInfo(BaseModel):
    schema_name: str
    table_name: str
    column_name: str


class OutputSchema(BaseModel):
    output: Dict[str, ColumnInfo]


def convert_to_smart_table(db: Session, request: ConvertToSmart):
    user_db_engine = connect_to_user_db()
    table = crud.tables.get_object_by_id_or_404(db, id=request.table_id)
    db_schema, gpt_schema = get_db_schema(user_db_engine)
    user_sql = table.property["code"]
    column_names = get_column_names(user_db_engine, user_sql)
    smart_col_paths = call_gpt(user_sql, column_names, gpt_schema)

    # Fill smart col data before validation to get
    # primary keys along with other column metadata
    smart_cols = fill_smart_cols_data(smart_col_paths, db_schema)

    # Validate smart cols will delete invalid cols from smart_cols
    validated = validate_smart_cols(user_db_engine, smart_cols, user_sql)

    columns = crud.columns.get_table_columns(db, table_id=table.id)
    for col in columns:
        if col.name in validated:
            col.property = smart_cols[col.name].dict()
    db.commit()
    user_db_engine.dispose()

    col_status = {col_name: col_name in validated for col_name in smart_col_paths}
    return col_status


def fill_smart_cols_data(
    smart_col_paths: dict, db_schema: FullDBSchema
) -> dict[str, PgColumnBaseProperty]:
    smart_cols_data = {}
    for name, col_path in smart_col_paths.items():
        try:
            schema = col_path["schema_name"]
            table = col_path["table_name"]
            column = col_path["column_name"]
            col_schema_data = db_schema[schema][table][column]
        except KeyError:
            # Skip ChatGPT "hallucinated" columns
            continue

        smart_cols_data[name] = PgColumnBaseProperty(name=name, **col_schema_data)
    return smart_cols_data


def call_gpt(user_sql: str, column_names: list, db_schema: dict) -> OutputSchema:
    try:
        gpt_input = get_gpt_input(db_schema, user_sql, column_names)
        gpt_output = str(
            openai.ChatCompletion.create(
                model=GPT_MODEL,
                temperature=GPT_TEMPERATURE,
                messages=[{"role": "user", "content": gpt_input}],
            )
        )

        output_dict = json.loads(gpt_output).get("choices", [{"message": {"content": "{}"}}])[0][
            "message"
        ]["content"]
        output = json.loads(output_dict)
        # validate output
        OutputSchema(output=output)
        return output
    except Exception as e:
        print(e)
        return {}
