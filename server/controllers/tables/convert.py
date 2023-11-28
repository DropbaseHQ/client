import json
from typing import Dict

import openai
from pydantic import BaseModel

from server.constants import GPT_MODEL, GPT_TEMPERATURE
from server.controllers.state.models import PgColumnDefinedProperty
from server.controllers.tables.helper import FullDBSchema
from server.credentials import OPENAI_API_KEY, OPENAI_ORG_ID

from .gpt_template import get_gpt_input

openai.organization = OPENAI_ORG_ID
openai.api_key = OPENAI_API_KEY


class ColumnInfo(BaseModel):
    schema_name: str
    table_name: str
    column_name: str


class OutputSchema(BaseModel):
    output: Dict[str, ColumnInfo]


def fill_smart_cols_data(
    smart_col_paths: dict, db_schema: FullDBSchema
) -> dict[str, PgColumnDefinedProperty]:
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
        print(col_schema_data)
        smart_cols_data[name] = PgColumnDefinedProperty(name=name, **col_schema_data)
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
