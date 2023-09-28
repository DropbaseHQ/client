from pathlib import Path

import pytest

from server.tests.conftest import ValueStorage
from server.tests.utils import has_obj_with_id

FILE_NAME = Path(__file__).name


@pytest.mark.filename(FILE_NAME)
def test_create_functions(client):
    data = {
        "name": "test func",
        "code": "def f():\n    print('hello world')",
        "test_code": "f()",
        "page_id": ValueStorage.page_id,
        "type": "python"
    }
    response = client.post("/functions/", json=data)
    assert response.status_code == 200
    ValueStorage.function_id = response.json()["id"]
    assert response.json()["name"] == "test func"


@pytest.mark.filename(FILE_NAME)
def test_read_functions(client):
    response = client.get(f"/functions/{ValueStorage.function_id}")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_get_page_functions(client):
    response = client.get(f"/functions/page/{ValueStorage.page_id}")
    assert response.status_code == 200
    assert has_obj_with_id(response.json(), id=ValueStorage.function_id)


@pytest.mark.filename(FILE_NAME)
def test_get_page_ui_functions(client):
    response = client.get(f"/functions/page/ui/{ValueStorage.page_id}")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_update_functions(client):
    update_code = "def f():\n    return 2"
    data = {
        "name": "test func",
        "code": update_code,
        "test_code": "f()",
        "page_id": ValueStorage.page_id,
        "type": "python"
    }
    response = client.put(f"/functions/{ValueStorage.function_id}", json=data)
    assert response.status_code == 200
    assert response.json()["code"] == update_code


@pytest.mark.filename(FILE_NAME)
def test_delete_functions(client):
    response = client.delete(f"/functions/{ValueStorage.function_id}")
    assert response.status_code == 200
    test_create_functions(client)  # recreate resource
