# from pathlib import Path

# import pytest

# from server.tests.conftest import ValueStorage
# from server.tests.constants import *

# FILE_NAME = Path(__file__).name


# @pytest.mark.filename(FILE_NAME)
# def test_create_role(client):
#     data = {
#         "user_id": ValueStorage.user_id,
#         "workspace_id": ValueStorage.workspace_id,
#         "role": ADMIN_ROLE_ID,
#     }
#     response = client.post("/role/", json=data)
#     assert response.status_code == 200
#     ValueStorage.user_role_id = response.json()["id"]
#     assert response.json()["user_id"] == ValueStorage.user_id


# @pytest.mark.filename(FILE_NAME)
# def test_read_role(client):
#     response = client.get(f"/role/{ValueStorage.user_role_id}")
#     assert response.status_code == 200


# @pytest.mark.filename(FILE_NAME)
# def test_update_role(client):
#     raise NotImplementedError("test not implemented")


# @pytest.mark.filename(FILE_NAME)
# def test_delete_role(client):
#     response = client.delete(f"/role/{ValueStorage.user_role_id}")
#     assert response.status_code == 200
#     test_create_role(client)  # recreate resource
