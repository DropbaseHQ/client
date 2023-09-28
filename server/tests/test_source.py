import pytest

from server.schemas.source import SourceType
from server.tests.conftest import ValueStorage
from server.tests.constants import *


@pytest.mark.order(3)
class TestSource:
    def test_create_source(self, client):
        data = {
            "name": "test_pg_source",
            "workspace_id": ValueStorage.workspace_id,
            "description": "this is from server/tests/test_source.py in function test_create_source",
            "type": SourceType.POSTGRES,
            "creds": {
                "host": TEST_DB_HOST,
                "port": TEST_DB_PORT,
                "username": TEST_DB_USER,
                "password": TEST_DB_PASS,
                "database": TEST_DB_NAME,
            },
        }
        response = client.post("/source/", json=data)
        assert response.status_code == 200
        assert response.json()["name"] == "test_pg_source"
        ValueStorage.source_id = response.json()["id"]


    def test_create_source_invalid_creds(self, client):
        data = {
            "name": "test_pg_test_source",
            "workspace_id": ValueStorage.workspace_id,
            "description": "this is from server/tests/test_source.py in function test_create_source_invalid_creds",
            "type": SourceType.POSTGRES,
            "creds": {
                "host": TEST_DB_HOST,
                "port": TEST_DB_PORT,
                "username": TEST_DB_USER,
                "password": "",
                "database": TEST_DB_NAME,
            },
        }
        response = client.post("/source/", json=data)
        assert response.status_code == 400


    def test_create_source_invalid_type(self, client):
        data = {
            "name": "test_pg_source",
            "workspace_id": ValueStorage.workspace_id,
            "description": "this is from server/tests/test_source.py in function test_create_source_invalid_type",
            "type": "random invalid source type that has never before been seen",
            "creds": {
                "host": TEST_DB_HOST,
                "port": TEST_DB_PORT,
                "username": TEST_DB_USER,
                "password": TEST_DB_PASS,
                "database": TEST_DB_NAME,
            },
        }
        response = client.post("/source/", json=data)
        assert response.status_code == 422
        assert response.json()["detail"][0]["type"] == "type_error.enum"


    def test_read_source(self, client):
        response = client.get(f"/source/{ValueStorage.source_id}")
        assert response.status_code == 200


    def test_read_source_not_found(self, client):
        response = client.get(f"/source/{MOCK_NONEXISTENT_UUID}")
        assert response.status_code == 404


    def test_update_source(self, client):
        data = {
            "name": "test_pg_source_updated",
            "description": "this is from server/tests/test_source.py in function test_update_source",
            "type": SourceType.POSTGRES,
            "creds": {
                "host": TEST_DB_HOST,
                "port": TEST_DB_PORT,
                "username": TEST_DB_USER,
                "password": TEST_DB_PASS,
                "database": TEST_DB_NAME,
            },
        }
        response = client.put(f"/source/{ValueStorage.source_id}", json=data)
        assert response.status_code == 200
        assert response.json()["name"] == "test_pg_source_updated"


    def test_update_source_not_found(self, client):
        data = {
            "name": "test_pg_source_updated",
            "description": "this is from server/tests/test_source.py in function test_update_source",
            "type": SourceType.POSTGRES,
            "creds": {
                "host": TEST_DB_HOST,
                "port": TEST_DB_PORT,
                "username": TEST_DB_USER,
                "password": TEST_DB_PASS,
                "database": TEST_DB_NAME,
            },
        }
        response = client.put(f"/source/{MOCK_NONEXISTENT_UUID}", json=data)
        assert response.status_code == 404


    def test_update_source_invalid_creds(self, client):
        data = {
            "name": "test_pg_test_source",
            "description": "this is from server/tests/test_source.py in function test_update_source_invalid_creds",
            "type": SourceType.POSTGRES,
            "creds": {
                "host": TEST_DB_HOST,
                "port": TEST_DB_PORT,
                "username": TEST_DB_USER,
                "password": "",
                "database": TEST_DB_NAME,
            },
        }
        response = client.put(f"/source/{ValueStorage.source_id}", json=data)
        assert response.status_code == 400


    def test_update_source_invalid_type(self, client):
        data = {
            "name": "test_pg_source",
            "description": "this is from server/tests/test_source.py in function test_update_source_invalid_type",
            "type": "random invalid source type that has never before been seen",
            "creds": {
                "host": TEST_DB_HOST,
                "port": TEST_DB_PORT,
                "username": TEST_DB_USER,
                "password": TEST_DB_PASS,
                "database": TEST_DB_NAME,
            },
        }
        response = client.put(f"/source/{ValueStorage.source_id}", json=data)
        assert response.status_code == 422
        assert response.json()["detail"][0]["type"] == "type_error.enum"


    def test_delete_source(self, client):
        response = client.delete(f"/source/{ValueStorage.source_id}")
        assert response.status_code == 200
        ValueStorage.source_id = None


    def test_delete_source_not_found(self, client):
        response = client.delete(f"/source/{MOCK_NONEXISTENT_UUID}")
        assert response.status_code == 404
