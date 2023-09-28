from pathlib import Path

import pytest

from server.tests.conftest import ValueStorage

FILE_NAME = Path(__file__).name


@pytest.mark.filename(FILE_NAME)
def test_create_components(client):
    data = {
        "property": {"name": "my_button", "label": "my label"},
        "widget_id": ValueStorage.widget_id,
        "type": "button",
    }
    response = client.post("/components/", json=data)
    ValueStorage.component_id = response.json()["id"]
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_read_components(client):
    response = client.get(f"/components/{ValueStorage.component_id}")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_update_components(client):
    data = {
        "property": {"name": "new my_button", "label": "my label"},
        "widget_id": ValueStorage.widget_id,
        "type": "button",
    }
    response = client.put(f"/components/{ValueStorage.component_id}", json=data)
    assert response.status_code == 200
    assert response.json()["property"]["name"] == "new my_button"


@pytest.mark.filename(FILE_NAME)
def test_delete_components(client):
    response = client.delete(f"/components/{ValueStorage.component_id}")
    assert response.status_code == 200
    ValueStorage.component_id = None


@pytest.mark.filename(FILE_NAME)
def test_create_components_fail(client):
    data = {"code": 'name = UIComponent():\n    name = "name"', "app_id": f"{ValueStorage.app_id[:-1]}1"}
    response = client.post("/components/", json=data)
    assert response.status_code != 200
