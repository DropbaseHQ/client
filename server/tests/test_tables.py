from pathlib import Path

import pytest

from server.tests.conftest import ValueStorage
from server.tests.constants import *

FILE_NAME = Path(__file__).name


@pytest.mark.filename(FILE_NAME)
def test_create_tables(client):
    data = {
        "name": "test_table",
        "property": {
            "name": "test_table",
            "code": "",
        },
        "page_id": ValueStorage.page_id,
        "state": {},
    }
    response = client.post("/tables/", json=data)
    assert response.status_code == 200
    ValueStorage.table_id = response.json()["id"]
    assert response.json()["name"] == "test_table"


@pytest.mark.filename(FILE_NAME)
def test_read_tables(client):
    response = client.get(f"/tables/{ValueStorage.table_id}")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_get_table_properties_req(client):
    response = client.get(f"/tables/properties")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_get_table_schema(client):
    response = client.get(f"/tables/schema/{ValueStorage.table_id}")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_get_table_req(client):
    data = {
        "table_id": ValueStorage.table_id,
        "page_id": ValueStorage.page_id,
    }
    response = client.post(f"/tables/query", json=data)
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_get_table_req(client):
    data = {
        "table_id": ValueStorage.table_id,
        "page_id": ValueStorage.page_id,
    }
    response = client.post(f"/tables/query", json=data)
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_get_table_req(client):
    data = {
        "table_id": ValueStorage.table_id,
        "page_id": ValueStorage.page_id,
    }
    response = client.post(f"/tables/query", json=data)
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_update_tables(client):
    update_table_code = "select id, email from public.user;"
    data = {
        "name": "test_table",
        "property": {
            "name": "test_table",
            "code": update_table_code,
        },
        "page_id": ValueStorage.page_id,
        "source_id": ValueStorage.source_id,
        "state": {},
    }
    response = client.put(f"/tables/{ValueStorage.table_id}", json=data)
    assert response.status_code == 200
    assert response.json()["property"]["code"] == update_table_code


@pytest.mark.filename(FILE_NAME)
def test_convert_to_smart_req(client):
    # data = {"table_id": ValueStorage.table_id}
    # response = client.post(f"/tables/convert", json=data)
    # assert response.status_code == 200
    # assert response.json().get("id")
    # assert response.json().get("email")
    pass


@pytest.mark.filename(FILE_NAME)
def test_pin_filters_req(client):
    test_filter = {
        "column_name": "email",
        "condition": "<",
    }
    data = {
        "table_id": ValueStorage.table_id,
        "filters": [test_filter],
    }
    response = client.post(f"/tables/pin_filters", json=data)
    import pdb;pdb.set_trace()
    assert response.status_code == 200
    assert test_filter in response.json()["property"]["filters"]


@pytest.mark.filename(FILE_NAME)
def test_delete_tables(client):
    response = client.delete(f"/tables/{ValueStorage.table_id}")
    assert response.status_code == 200
    test_create_tables(client)  # recreate resource
