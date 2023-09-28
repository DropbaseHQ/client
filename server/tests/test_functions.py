import pytest

from server.tests.conftest import ValueStorage


@pytest.mark.order(2)
class TestFunctions:
    def test_create_functions(self, client):
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


    def test_read_functions(self, client):
        response = client.get(f"/functions/{ValueStorage.function_id}")
        assert response.status_code == 200


    def test_update_functions(self, client):
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


    def test_delete_functions(self, client):
        response = client.delete(f"/functions/{ValueStorage.function_id}")
        assert response.status_code == 200
        ValueStorage.function_id = None
