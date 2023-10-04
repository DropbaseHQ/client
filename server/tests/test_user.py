from pathlib import Path

import pytest

from server.tests.conftest import ValueStorage, register_test_user, login_test_user
from server.tests.constants import *
from server.tests.utils import has_obj_with_id

FILE_NAME = Path(__file__).name


@pytest.mark.filename(FILE_NAME)
def test_read_user(client):
    response = client.get(f"/user/{ValueStorage.user_id}")
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_read_user(client):
    response = client.get(f"/user/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code == 404


@pytest.mark.filename(FILE_NAME)
def test_register_user(client):
    # test that register call in client setup was successful
    assert ValueStorage.user_id
    assert ValueStorage.workspace_id


@pytest.mark.filename(FILE_NAME)
def test_register_user_email_in_use(client):
    response = client.post("/user/register", json={
        "name": "test user",
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
    })
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_login_user(client):
    # test that login call in client setup was successful
    assert client.cookies.get("access_token_cookie")
    assert client.cookies.get("refresh_token_cookie")


@pytest.mark.filename(FILE_NAME)
def test_login_user_invalid_credentials(client):
    response = client.post("/user/login", json={
        "email": TEST_USER_EMAIL,
        "password": "aosnaosnfadaskdlajdlaskdas;ldncwocnwe",
    })
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_refresh_user(client):
    response = client.post(f"/user/refresh")
    assert response.status_code == 200
    client.cookies = {
        "access_token_cookie": response.cookies.get("access_token_cookie"),
        "refresh_token_cookie": response.cookies.get("refresh_token_cookie"),
    }


@pytest.mark.filename(FILE_NAME)
def test_update_user(client):
    update_user_name = "jeremy 985"
    data = {
        "name": update_user_name,
        "email": TEST_USER_EMAIL,
        "active": True,
    }
    response = client.put(f"/user/{ValueStorage.user_id}", json=data)
    assert response.status_code == 200
    assert response.json()["name"] == update_user_name


@pytest.mark.filename(FILE_NAME)
def test_update_user_not_found(client):
    update_user_name = "jeremy 985"
    data = {
        "name": update_user_name,
        "email": TEST_USER_EMAIL,
        "active": True,
    }
    response = client.put(f"/user/{MOCK_NONEXISTENT_UUID}", json=data)
    assert response.status_code == 404


@pytest.mark.filename(FILE_NAME)
def test_update_user_email_in_use(client):
    update_user_name = "jeremy 985"
    data = {
        "name": update_user_name,
        "email": "az@dropbase.io",
        "active": True,
    }
    response = client.put(f"/user/{ValueStorage.user_id}", json=data)
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_reset_password(client):
    update_password = "100"
    data = {
        "email": TEST_USER_EMAIL,
        "new_password": update_password,
    }
    response = client.post(f"/user/reset_password", json=data)
    assert response.status_code == 200


@pytest.mark.filename(FILE_NAME)
def test_reset_password_email_not_found(client):
    update_password = "100"
    data = {
        "email": "bruh",
        "new_password": update_password,
    }
    response = client.post(f"/user/reset_password", json=data)
    assert response.status_code != 200


@pytest.mark.filename(FILE_NAME)
def test_delete_user(client):
    response = client.delete(f"/user/{ValueStorage.user_id}")
    assert response.status_code == 200
    # recreate resource
    register_test_user(client)
    login_test_user(client)


@pytest.mark.filename(FILE_NAME)
def test_delete_user_not_found(client):
    response = client.delete(f"/user/{MOCK_NONEXISTENT_UUID}")
    assert response.status_code == 404


@pytest.mark.filename(FILE_NAME)
def test_get_user_workspaces(client):
    response = client.get(f"/user/workspaces")
    assert response.status_code == 200
    assert has_obj_with_id(response.json(), id=ValueStorage.workspace_id)


@pytest.mark.filename(FILE_NAME)
def test_logout_user(client):
    response = client.delete(f"/user/logout")
    assert response.status_code == 200
    login_test_user(client)
