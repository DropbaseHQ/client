from pathlib import Path

import pytest

from server.tests.conftest import ValueStorage
from server.tests.constants import *

FILE_NAME = Path(__file__).name


@pytest.mark.filename(FILE_NAME)
def test_create_workspace(client):
    # TODO implement POST /user
    raise NotImplementedError("test not implemented")


@pytest.mark.filename(FILE_NAME)
def test_read_workspace(client):
    response = client.get(f"/workspace/{ValueStorage.workspace_id}")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_update_workspace(client):
    update_workspace_name = "jeremy 985's workspace"
    data = {
        "name": update_workspace_name,
        "active": True,
    }
    response = client.put(f"/workspace/{ValueStorage.workspace_id}", json=data)
    assert response.status_code == 200
    assert response.json()["name"] == update_workspace_name


@pytest.mark.filename(FILE_NAME)
def test_delete_workspace(client):
    response = client.delete(f"/workspace/{ValueStorage.workspace_id}")
    assert response.status_code == 200
    # workspace will be recreated in test_user.py
    # using the register endpoint.
