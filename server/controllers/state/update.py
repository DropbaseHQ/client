import json

import requests

from server.credentials import WORKER_API


def update_state_context_in_worker(State, Context):
    payload = {
        "app_name": "app",
        "page_name": "page1",
        "state": State.schema(),
        "context": Context.schema(),
    }
    requests.post(f"{WORKER_API}/files/generate_schema/", data=json.dumps(payload))


def get_columns_from_worker(table: dict, state: dict):
    payload = {"app_name": "app", "page_name": "page1", "table": table, "state": state}
    res = requests.post(f"{WORKER_API}/query/get_table_columns/", json=payload)
    return res.json()
