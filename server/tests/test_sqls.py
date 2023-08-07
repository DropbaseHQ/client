from fastapi.testclient import TestClient

from server.main import app

client = TestClient(app)

from server.tests.conftest import ValueStorage


def test_create_sqls():
    data = {"code": "select * from test", "app_id": ValueStorage.app_id}
    response = client.post("/sqls/", json=data)
    assert response.status_code == 200
    ValueStorage.sql_id = response.json()["id"]


def test_read_sqls():
    response = client.get(f"/sqls/{ValueStorage.sql_id}")
    assert response.status_code == 200


def test_update_sqls():
    update_code = "select * from test2"
    data = {"code": update_code, "app_id": ValueStorage.app_id}
    response = client.put(f"/sqls/{ValueStorage.sql_id}", json=data)
    assert response.status_code == 200
    assert response.json()["code"] == update_code


def test_delete_sqls():
    response = client.delete(f"/sqls/{ValueStorage.sql_id}")
    assert response.status_code == 200
    ValueStorage.sql_id = None
