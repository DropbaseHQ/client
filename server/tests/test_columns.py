from pathlib import Path

import pytest

from server.tests.conftest import ValueStorage
from server.tests.constants import *
from server.tests.utils import has_obj_with_id

FILE_NAME = Path(__file__).name


@pytest.mark.filename(FILE_NAME)
def test_create_columns(client):
    data = {
        "name": "test columns",
        "property": {
            "name": "age",
            "unique": False,
            "visible": True,
            "editable": False,
            "nullable": True,
            "edit_keys": [],
            "foreign_key": False,
            "primary_key": False,
        },
        "table_id": ValueStorage.table_id,
        "type": "postgres"
    }
    response = client.post("/columns/", json=data)
    assert response.status_code == 200
    response_body = response.json()
    ValueStorage.columns_id = response_body["id"]
    assert response.json()["name"] == "test columns"


@pytest.mark.filename(FILE_NAME)
def test_create_columns_invalid_type(client):
    data = {
        "name": "test columns",
        "property": {
            "name": "age",
            "unique": False,
            "visible": True,
            "editable": False,
            "nullable": True,
            "edit_keys": [],
            "foreign_key": False,
            "primary_key": False,
        },
        "table_id": ValueStorage.table_id,
        "type": "post office"
    }
    response = client.post("/columns/", json=data)
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_create_columns_table_not_found(client):
    data = {
        "name": "test columns",
        "property": {
            "name": "age",
            "unique": False,
            "visible": True,
            "editable": False,
            "nullable": True,
            "edit_keys": [],
            "foreign_key": False,
            "primary_key": False,
        },
        "table_id": MOCK_NONEXISTENT_UUID,
        "type": "postgres"
    }
    response = client.post("/columns/", json=data)
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_read_columns(client):
    response = client.get(f"/columns/{ValueStorage.columns_id}")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_read_columns_not_found(client):
    response = client.get(f"/columns/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_get_table_columns(client):
    response = client.get(f"/columns/table/{ValueStorage.table_id}")
    assert response.status_code == 200
    assert has_obj_with_id(response.json()["values"], id=ValueStorage.columns_id)


@pytest.mark.filename(FILE_NAME)
def test_get_table_columns_not_found(client):
    response = client.get(f"/columns/table/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_update_columns(client):
    update_name = "test columns updated"
    data = {
        "name": update_name,
        "property": {
            "name": update_name,
            "unique": False,
            "visible": True,
            "editable": False,
            "nullable": True,
            "edit_keys": [],
            "foreign_key": False,
            "primary_key": False,
        },
        "table_id": ValueStorage.table_id,
        "type": "postgres"
    }
    response = client.put(f"/columns/{ValueStorage.columns_id}", json=data)
    assert response.status_code == 200
    assert response.json()["name"] == update_name


@pytest.mark.filename(FILE_NAME)
def test_update_columns_not_found(client):
    update_name = "test columns updated"
    data = {
        "name": update_name,
        "property": {
            "name": "age",
            "unique": False,
            "visible": True,
            "editable": False,
            "nullable": True,
            "edit_keys": [],
            "foreign_key": False,
            "primary_key": False,
        },
        "table_id": ValueStorage.table_id,
        "type": "postgres"
    }
    response = client.put(f"/columns/{MOCK_NONEXISTENT_UUID}", json=data)
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_delete_columns(client):
    response = client.delete(f"/columns/{ValueStorage.columns_id}")
    assert response.status_code == 200
    test_create_columns(client)  # recreate resource


@pytest.mark.filename(FILE_NAME)
def test_delete_columns_not_found(client):
    response = client.delete(f"/columns/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code != 200
