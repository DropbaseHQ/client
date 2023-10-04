from pathlib import Path

import pytest

from server.tests.conftest import ValueStorage
from server.tests.constants import *

FILE_NAME = Path(__file__).name


@pytest.mark.filename(FILE_NAME)
def test_create_widget(client):
    data = {
        "name": "test widget",
        "property": {
            "name": "test widget property",
            "description": "test widget description",
        },
        "page_id": ValueStorage.page_id,
    }
    response = client.post("/widget/", json=data)
    assert response.status_code == 200
    ValueStorage.widget_id = response.json()["id"]
    assert response.json()["name"] == "test widget property"


@pytest.mark.filename(FILE_NAME)
def test_create_widget_not_found(client):
    data = {
        "name": "test widget",
        "property": {
            "name": "test widget property",
            "description": "test widget description",
        },
        "page_id": MOCK_NONEXISTENT_UUID,
    }
    response = client.post("/widget/", json=data)
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_read_widget(client):
    response = client.get(f"/widget/{ValueStorage.widget_id}")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_read_widget_not_found(client):
    response = client.get(f"/widget/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_get_widget_ui(client):
    response = client.get(f"/widget/ui/{ValueStorage.widget_id}")
    assert response.status_code == 200
    assert response.json()["widget"]["id"] == ValueStorage.widget_id


@pytest.mark.filename(FILE_NAME)
def test_get_widget_ui_not_found(client):
    response = client.get(f"/widget/ui/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_update_widget(client):
    update_desc = "updated test widget description"
    data = {
        "name": "test widget",
        "property": {
            "name": "test widget property",
            "description": update_desc,
        },
        "page_id": ValueStorage.page_id,
    }
    response = client.put(f"/widget/{ValueStorage.widget_id}", json=data)
    assert response.status_code == 200
    assert response.json()["property"]["description"] == update_desc


@pytest.mark.filename(FILE_NAME)
def test_update_widget_not_found(client):
    update_desc = "updated test widget description"
    data = {
        "name": "test widget",
        "property": {
            "name": "test widget property",
            "description": update_desc,
        },
        "page_id": ValueStorage.page_id,
    }
    response = client.put(f"/widget/{MOCK_NONEXISTENT_UUID}", json=data)
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_update_widget_page_not_found(client):
    update_desc = "updated test widget description"
    data = {
        "name": "test widget",
        "property": {
            "name": "test widget property",
            "description": update_desc,
        },
        "page_id": MOCK_NONEXISTENT_UUID,
    }
    response = client.put(f"/widget/{ValueStorage.widget_id}", json=data)
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_delete_widget(client):
    response = client.delete(f"/widget/{ValueStorage.widget_id}")
    assert response.status_code == 200
    test_create_widget(client)  # recreate resource


@pytest.mark.filename(FILE_NAME)
def test_delete_widget_not_found(client):
    response = client.delete(f"/widget/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code != 200
