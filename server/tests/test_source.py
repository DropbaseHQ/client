from fastapi.testclient import TestClient

from server.main import app
from server.schemas.source import SourceType

client = TestClient(app)

from server.tests.conftest import ValueStorage


MOCK_NONEXISTENT_UUID = "4d181f7d-d00a-4899-8235-1308ef20b46f"


def test_create_source(mocker):
    mocker.patch("server.controllers.source.source.test_source_creds_postgres")
    data = {
        "name": "test_pg_source",
        "description": "this is from server/tests/test_source.py in function test_create_source",
        "type": SourceType.POSTGRES,
        "creds": {
            "host": "test_host",
            "port": 5432,
            "username": "test_username",
            "password": "test_password",
            "database": "test_database",
        },
    }
    response = client.post("/source/", json=data)
    assert response.status_code == 200
    assert response.json()["name"] == "test_pg_source"
    ValueStorage.source_id = response.json()["id"]


def test_create_source_invalid_creds():
    data = {
        "name": "test_pg_test_source",
        "description": "this is from server/tests/test_source.py in function test_create_source_invalid_creds",
        "type": SourceType.POSTGRES,
        "creds": {
            "host": "test_host",
            "port": 5432,
            "username": "test_username",
            "password": "test_password",
            "database": "test_database",
        },
    }
    response = client.post("/source/", json=data)
    assert response.status_code == 400


def test_create_source_invalid_type(mocker):
    mocker.patch("server.controllers.source.source.test_source_creds_postgres")
    data = {
        "name": "test_pg_source",
        "description": "this is from server/tests/test_source.py in function test_create_source_invalid_type",
        "type": "random invalid source type that has never before been seen",
        "creds": {
            "host": "test_host",
            "port": 5432,
            "username": "test_username",
            "password": "test_password",
            "database": "test_database",
        },
    }
    response = client.post("/source/", json=data)
    assert response.status_code == 422
    assert response.json()["detail"][0]["type"] == "type_error.enum"


def test_read_source():
    response = client.get(f"/source/{ValueStorage.source_id}")
    assert response.status_code == 200


def test_read_source_not_found():
    response = client.get(f"/source/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code == 404


def test_update_source(mocker):
    mocker.patch("server.controllers.source.source.test_source_creds_postgres")
    data = {
        "name": "test_pg_source_updated",
        "description": "this is from server/tests/test_source.py in function test_update_source",
        "type": SourceType.POSTGRES,
        "creds": {
            "host": "test_host",
            "port": 5432,
            "username": "test_username",
            "password": "",
            "database": "test_database",
        },
    }
    response = client.put(f"/source/{ValueStorage.source_id}", json=data)
    assert response.status_code == 200
    assert response.json()["name"] == "test_pg_source_updated"


def test_update_source_not_found():
    data = {
        "name": "test_pg_source_updated",
        "description": "this is from server/tests/test_source.py in function test_update_source",
        "type": SourceType.POSTGRES,
        "creds": {
            "host": "test_host",
            "port": 5432,
            "username": "test_username",
            "password": "",
            "database": "test_database",
        },
    }
    response = client.put(f"/source/{MOCK_NONEXISTENT_UUID}", json=data)
    assert response.status_code == 404


def test_update_source_invalid_creds():
    data = {
        "name": "test_pg_test_source",
        "description": "this is from server/tests/test_source.py in function test_update_source_invalid_creds",
        "type": SourceType.POSTGRES,
        "creds": {
            "host": "test_host",
            "port": 5432,
            "username": "test_username",
            "password": "test_password",
            "database": "test_database",
        },
    }
    response = client.put(f"/source/{ValueStorage.source_id}", json=data)
    assert response.status_code == 400


def test_update_source_invalid_type(mocker):
    mocker.patch("server.controllers.source.source.test_source_creds_postgres")
    data = {
        "name": "test_pg_source",
        "description": "this is from server/tests/test_source.py in function test_update_source_invalid_type",
        "type": "random invalid source type that has never before been seen",
        "creds": {
            "host": "test_host",
            "port": 5432,
            "username": "test_username",
            "password": "test_password",
            "database": "test_database",
        },
    }
    response = client.put(f"/source/{ValueStorage.source_id}", json=data)
    assert response.status_code == 422
    assert response.json()["detail"][0]["type"] == "type_error.enum"


def test_delete_source():
    response = client.delete(f"/source/{ValueStorage.source_id}")
    assert response.status_code == 200
    ValueStorage.source_id = None


def test_delete_source_not_found():
    response = client.delete(f"/source/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code == 404
