import json

import requests

from server.credentials import WORKER_API


def update_state_context_in_worker(State, Context, app_name, page_name, token):
    payload = {
        "app_name": app_name,
        "page_name": page_name,
        "state": State.schema(),
        "context": Context.schema(),
    }
    requests.post(f"{WORKER_API}/{token}/worker/files/generate_schema/", data=json.dumps(payload))


def get_columns_from_worker(table: dict, state: dict, app_name, page_name, token):
    payload = {"app_name": app_name, "page_name": page_name, "table": table, "state": state}
    res = requests.post(f"{WORKER_API}/{token}/worker/query/get_table_columns/", json=payload)
    return res.json()