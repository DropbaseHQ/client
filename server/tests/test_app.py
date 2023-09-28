from pathlib import Path

import pytest

from server.tests.conftest import ValueStorage

FILE_NAME = Path(__file__).name


@pytest.mark.filename(FILE_NAME)
def test_create_app(client):
    data = {
        "name": "test app",
        "workspace_id": ValueStorage.workspace_id,
    }
    response = client.post("/app/", json=data)
    assert response.status_code == 200
    response_body = response.json()
    ValueStorage.app_id = response_body["app"]["id"]
    ValueStorage.page_id = response_body["page"]["id"]
    ValueStorage.table_id = response_body["table"]["id"]
    assert response.json()["app"]["name"] == "test app"


@pytest.mark.filename(FILE_NAME)
def test_read_app(client):
    response = client.get(f"/app/{ValueStorage.app_id}")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_update_app(client):
    update_name = "test app updated"
    data = {
        "name": update_name,
    }
    response = client.put(f"/app/{ValueStorage.app_id}", json=data)
    assert response.status_code == 200
    assert response.json()["name"] == update_name


@pytest.mark.filename(FILE_NAME)
def test_delete_app(client):
    response = client.delete(f"/app/{ValueStorage.app_id}")
    assert response.status_code == 200
    test_create_app(client)  # recreate resource
