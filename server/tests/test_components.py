import pytest
from server.tests.conftest import ValueStorage


@pytest.mark.order(1)
class TestComponent:
    def test_create_components(self, client):
        data = {
            "property": {"name": "my_button", "label": "my label"},
            "widget_id": ValueStorage.widget_id,
            "type": "button",
        }
        response = client.post("/components/", json=data)
        ValueStorage.component_id = response.json()["id"]
        assert response.status_code == 200


    def test_read_components(self, client):
        response = client.get(f"/components/{ValueStorage.component_id}")
        assert response.status_code == 200


    def test_update_components(self, client):
        data = {
            "property": {"name": "new my_button", "label": "my label"},
            "widget_id": ValueStorage.widget_id,
            "type": "button",
        }
        response = client.put(f"/components/{ValueStorage.component_id}", json=data)
        assert response.status_code == 200
        assert response.json()["property"]["name"] == "new my_button"


    def test_delete_components(self, client):
        response = client.delete(f"/components/{ValueStorage.component_id}")
        assert response.status_code == 200
        ValueStorage.component_id = None


    def test_create_components_fail(self, client):
        data = {"code": 'name = UIComponent():\n    name = "name"', "app_id": f"{ValueStorage.app_id[:-1]}1"}
        response = client.post("/components/", json=data)
        assert response.status_code != 200
