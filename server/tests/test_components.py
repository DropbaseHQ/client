from pathlib import Path

import pytest

from server.tests.conftest import ValueStorage
from server.tests.constants import *
from server.tests.utils import has_obj_with_id

FILE_NAME = Path(__file__).name


@pytest.mark.filename(FILE_NAME)
def test_create_components_button(client):
    data = {
        "property": {"name": "my_button", "label": "my label"},
        "widget_id": ValueStorage.widget_id,
        "type": "button",
    }
    response = client.post("/components/", json=data)
    ValueStorage.component_id = response.json()["id"]
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_create_components_select(client):
    data = {
        "property": {"name": "my_select", "label": "my label"},
        "widget_id": ValueStorage.widget_id,
        "type": "select",
        "after": ValueStorage.component_id,
    }
    response = client.post("/components/", json=data)
    ValueStorage.component_id = response.json()["id"]
    ValueStorage.after_component_id = response.json()["id"]
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_create_components_input(client):
    data = {
        "property": {"name": "my_input", "label": "my label"},
        "widget_id": ValueStorage.widget_id,
        "type": "input",
        "after": ValueStorage.component_id,
    }
    response = client.post("/components/", json=data)
    ValueStorage.component_id = response.json()["id"]
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_create_components_text(client):
    data = {
        "property": {"name": "my_text", "text": "my text"},
        "widget_id": ValueStorage.widget_id,
        "type": "text",
        "after": ValueStorage.component_id,
    }
    response = client.post("/components/", json=data)
    ValueStorage.component_id = response.json()["id"]
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_create_components_invalid_type(client):
    data = {
        "property": {"name": "my_text", "text": "where all the components come to get haircuts"},
        "widget_id": ValueStorage.widget_id,
        "type": "barbershop component",
    }
    response = client.post("/components/", json=data)
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_create_components_widget_not_found(client):
    data = {
        "property": {"name": "my_button", "label": "my label"},
        "widget_id": MOCK_NONEXISTENT_UUID,
        "type": "button",
    }
    response = client.post("/components/", json=data)
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_read_components(client):
    response = client.get(f"/components/{ValueStorage.component_id}")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_read_components_not_found(client):
    response = client.get(f"/components/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_get_widget_components(client):
    response = client.get(f"/components/widget/{ValueStorage.widget_id}")
    assert response.status_code == 200
    assert has_obj_with_id(response.json()["values"], id=ValueStorage.component_id)


@pytest.mark.filename(FILE_NAME)
def test_get_widget_components_not_found(client):
    response = client.get(f"/components/widget/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code != 200


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
def test_update_components_not_found(client):
    data = {
        "property": {"name": "new my_button", "label": "my label"},
        "widget_id": ValueStorage.widget_id,
        "type": "button",
    }
    response = client.put(f"/components/{MOCK_NONEXISTENT_UUID}", json=data)
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_delete_components(client):
    response = client.delete(f"/components/{ValueStorage.component_id}")
    assert response.status_code == 200
    test_create_components_button(client)  # recreate resource


@pytest.mark.filename(FILE_NAME)
def test_delete_components_not_found(client):
    response = client.delete(f"/components/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_reorder_components(client):
    data = {
        "widget_id": ValueStorage.widget_id,
        "component_id": ValueStorage.component_id,
        "after": ValueStorage.after_component_id,
    }
    response = client.post("components/reorder", json=data)
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_create_components_fail(client):
    data = {"code": 'name = UIComponent():\n    name = "name"', "app_id": f"{ValueStorage.app_id[:-1]}1"}
    response = client.post("/components/", json=data)
    assert response.status_code != 200
