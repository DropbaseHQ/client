# import json

# import requests

# from server.credentials import WORKER_API


# def update_state_context_in_worker(State, Context, app_name, page_name, token):
#     payload = {
#         "app_name": app_name,
#         "page_name": page_name,
#         "state": State.schema(),
#         "context": Context.schema(),
#     }
#     requests.post(
#         f"{WORKER_API}/worker/files/generate_schema/",
#         data=json.dumps(payload),
#         headers={"dropbase-proxy-token": token},
#     )
