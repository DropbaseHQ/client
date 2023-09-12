import os
import json
from json import JSONDecodeError

from dotenv import load_dotenv

from .gpt_template import get_gpt_input

load_dotenv()

from server.controllers.task.source_column_helper import connect_to_user_db

user_db_engine = connect_to_user_db()
import openai

openai.organization = os.getenv("OPENAI_ORG_ID")
openai.api_key = os.getenv("OPENAI_API_KEY")


def parse_gpt_output(data: str) -> dict[str, dict]:
    output_dict = json.loads(data).get("choices", [{"message": {"content": "{}"}}])[0]["message"]["content"]

    try:
        output_dict = json.loads(output_dict)
    except JSONDecodeError:
        return {}

    # Drop incorrectly formatted output columns
    parsed_output_dict = {}
    for column in output_dict:
        col_data = output_dict[column]
        if (
            type(col_data) is dict
            and col_data.get("name")
            and col_data.get("schema_name")
            and col_data.get("table_name")
            and col_data.get("column_name")
        ):
            parsed_output_dict[column] = output_dict[column]
    return parsed_output_dict


def get_gpt_output(gpt_input: str, model: str = "gpt-3.5-turbo", temperature: float = 0.0) -> str:

    return str(
        openai.ChatCompletion.create(
            model=model,
            temperature=temperature,
            messages=[{"role": "user", "content": gpt_input}],
        )
    )


def call_gpt(user_sql: str, column_names: list, db_schema: dict):
    gpt_input = get_gpt_input(db_schema, user_sql, column_names)
    gpt_output = get_gpt_output(gpt_input)
    print(gpt_output)
    smart_cols = parse_gpt_output(gpt_output)
    return smart_cols
