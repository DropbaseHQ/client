from pathlib import Path

import pytest

from server.tests.conftest import ValueStorage
from server.tests.constants import *

FILE_NAME = Path(__file__).name


@pytest.mark.filename(FILE_NAME)
def test_create_page(client):
    data = {
        "name": "test page",
        "app_id": ValueStorage.app_id,
    }
    response = client.post("/page/", json=data)
    assert response.status_code == 200
    ValueStorage.page_id = response.json()["id"]
    assert response.json()["name"] == "test page"


@pytest.mark.filename(FILE_NAME)
def test_create_page_not_found(client):
    data = {
        "name": "test page",
        "app_id": MOCK_NONEXISTENT_UUID,
    }
    response = client.post("/page/", json=data)
    assert response.status_code == 404


@pytest.mark.filename(FILE_NAME)
def test_read_page(client):
    response = client.get(f"/page/{ValueStorage.page_id}")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_read_page_not_found(client):
    response = client.get(f"/page/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_get_page_schema(client):
    response = client.get(f"/page/schema/{ValueStorage.page_id}")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_get_page_schema_not_found(client):
    response = client.get(f"/page/schema/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code == 404


@pytest.mark.filename(FILE_NAME)
def test_update_page(client):
    update_name = "test page updated"
    data = {
        "name": update_name,
        "app_id": ValueStorage.app_id,
    }
    response = client.put(f"/page/{ValueStorage.page_id}", json=data)
    assert response.status_code == 200
    assert response.json()["name"] == update_name


@pytest.mark.filename(FILE_NAME)
def test_update_page_not_found(client):
    update_name = "test page updated"
    data = {
        "name": update_name,
        "app_id": ValueStorage.app_id,
    }
    response = client.put(f"/page/{MOCK_NONEXISTENT_UUID}", json=data)
    assert response.status_code == 404


@pytest.mark.filename(FILE_NAME)
def test_update_page_app_not_found(client):
    update_name = "test page updated"
    data = {
        "name": update_name,
        "app_id": MOCK_NONEXISTENT_UUID,
    }
    response = client.put(f"/page/{ValueStorage.page_id}", json=data)
    assert response.status_code == 404


@pytest.mark.filename(FILE_NAME)
def test_delete_page(client):
    response = client.delete(f"/page/{ValueStorage.page_id}")
    assert response.status_code == 200
    test_create_page(client)  # recreate resource


@pytest.mark.filename(FILE_NAME)
def test_delete_page_not_found(client):
    response = client.delete(f"/page/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code == 404
