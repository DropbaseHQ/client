from pathlib import Path

import pytest

from server.tests.conftest import ValueStorage

FILE_NAME = Path(__file__).name


@pytest.mark.filename(FILE_NAME)
def test_create_widget(client):
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
    ValueStorage.widget_id = response.json()["id"]
    assert response.json()["name"] == "test widget property"
