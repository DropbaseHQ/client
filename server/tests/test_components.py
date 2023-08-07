from fastapi.testclient import TestClient

from server.main import app

client = TestClient(app)

from server.tests.conftest import ValueStorage


def test_create_components():
    data = {"code": 'name = UIComponent():\n    name = "name"', "app_id": ValueStorage.app_id}
    response = client.post("/components/", json=data)
    assert response.status_code == 200
    ValueStorage.component_id = response.json()["id"]


def test_read_components():
    response = client.get(f"/components/{ValueStorage.component_id}")
    assert response.status_code == 200


def test_update_components():
    update_code = 'name = UIComponent():\n    name = "new name"'
    data = {"code": update_code, "app_id": ValueStorage.app_id}
    response = client.put(f"/components/{ValueStorage.component_id}", json=data)
    assert response.status_code == 200
    assert response.json()["code"] == update_code


def test_delete_components():
    response = client.delete(f"/components/{ValueStorage.component_id}")
    assert response.status_code == 200
    ValueStorage.component_id = None


def test_create_components_fail():
    data = {"code": 'name = UIComponent():\n    name = "name"', "app_id": f"{ValueStorage.app_id[:-1]}1"}
    response = client.post("/components/", json=data)
    assert response.status_code != 200
