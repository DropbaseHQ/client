from pathlib import Path

import pytest

from server.tests.conftest import ValueStorage
from server.tests.constants import *

FILE_NAME = Path(__file__).name


@pytest.mark.filename(FILE_NAME)
def test_create_user_role(client):
    data = {
        "user_id": ValueStorage.user_id,
        "workspace_id": ValueStorage.workspace_id,
        "role_id": ADMIN_ROLE_ID,
    }
    response = client.post("/user_role/", json=data)
    assert response.status_code == 200
    ValueStorage.user_role_id = response.json()["id"]
    assert response.json()["user_id"] == ValueStorage.user_id


@pytest.mark.filename(FILE_NAME)
def test_read_user_role(client):
    response = client.get(f"/user_role/{ValueStorage.user_role_id}")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_update_user_role(client):
    update_role_id = DEV_ROLE_ID
    data = {
        "role_id": DEV_ROLE_ID,
    }
    response = client.put(f"/user_role/{ValueStorage.user_role_id}", json=data)
    assert response.status_code == 200
    assert response.json()["role_id"] == update_role_id


@pytest.mark.filename(FILE_NAME)
def test_delete_user_role(client):
    response = client.delete(f"/user_role/{ValueStorage.user_role_id}")
    assert response.status_code == 200
    test_create_user_role(client)  # recreate resource
