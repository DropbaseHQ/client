from contextlib import suppress

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import SQLAlchemyError

import server.crud as crud
from server.main import app
from server.utils.connect import get_db
from server.tests.constants import *


class ValueStorage:
    user_id = None
    workspace_id = None
    source_id = None


def pytest_sessionstart():
    pass


def pytest_sessionfinish():
    # delete db records created during testing
    db = next(get_db())
    with suppress(SQLAlchemyError):
        crud.user.remove(db, id=ValueStorage.user_id)
        crud.workspace.remove(db, id=ValueStorage.workspace_id)
        crud.source.remove(db, id=ValueStorage.source_id)


@pytest.fixture(scope="session")
def client():
    client = TestClient(app)

    # set up test user
    client.post("/user/register", json={
        "name": "test user",
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
    })

    # auth
    login_res = client.post("/user/login", json={
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
    })
    client.cookies = {
        "access_token_cookie": login_res.cookies.get("access_token_cookie"),
        "refresh_token_cookie": login_res.cookies.get("refresh_token_cookie"),
    }

    # record user and workspace ids
    login_res_body = login_res.json()
    ValueStorage.user_id = login_res_body["user"]["id"]
    ValueStorage.workspace_id = login_res_body["workspace"]["id"]

    return client
