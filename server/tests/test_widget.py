import pytest

from server.tests.conftest import ValueStorage


@pytest.mark.order(4)
class TestWidget:
    def test_create_widget(self, client):
        data = {
            "name": "test widget",
            "property": {
                "name": "test widget property",
                "description": "test widget description",
            },
            "page_id": ValueStorage.page_id,
        }
        response = client.post("/widget/", json=data)
        assert response.status_code == 200
        assert response.json()["name"] == "test widget property"
        ValueStorage.widget_id = response.json()["id"]
