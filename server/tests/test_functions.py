from fastapi.testclient import TestClient

from server.main import app

client = TestClient(app)

from server.tests.conftest import ValueStorage


def test_create_functions():
    data = {"code": "def test():\n    return 1", "app_id": ValueStorage.app_id}
    response = client.post("/functions/", json=data)
    assert response.status_code == 200
    ValueStorage.function_id = response.json()["id"]


def test_read_functions():
    response = client.get(f"/functions/{ValueStorage.function_id}")
    assert response.status_code == 200


def test_update_functions():
    update_code = "def test():\n    return 2"
    data = {"code": update_code, "app_id": ValueStorage.app_id}
    response = client.put(f"/functions/{ValueStorage.function_id}", json=data)
    assert response.status_code == 200
    assert response.json()["code"] == update_code


def test_delete_functions():
    response = client.delete(f"/functions/{ValueStorage.function_id}")
    assert response.status_code == 200
    ValueStorage.function_id = None
