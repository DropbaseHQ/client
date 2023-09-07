import json
import os

from dotenv import load_dotenv

from server.schemas.columns import PgColumnBaseProperty

from .gpt_template import get_gpt_input

load_dotenv()

from server.controllers.task.source_column_helper import connect_to_user_db

user_db_engine = connect_to_user_db()


def parse_gpt_output(data: str) -> dict[str, PgColumnBaseProperty]:
    # Returns [] if no choices are returned
    output_str = json.loads(data).get("choices", [{"message": {"content": "{}"}}])[0]["message"][
        "content"
    ]
    raw_cols = json.loads(output_str)
    smart_cols = {}
    for name, col in raw_cols.items():
        smart_cols[name] = PgColumnBaseProperty(
            name=name, schema_name=col["schema"], table_name=col["table"], columns_name=col["column"]
        )
    return smart_cols


def get_gpt_output(gpt_input: str, model: str = "gpt-3.5-turbo", temperature: float = 0.0) -> str:
    import openai

    openai.organization = os.getenv("OPENAI_ORG_ID")
    openai.api_key = os.getenv("OPENAI_API_KEY")
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
    smart_cols = parse_gpt_output(gpt_output)
    return smart_cols
