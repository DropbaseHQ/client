from fastapi.testclient import TestClient
from server.tests.authorization.utils import (
    HomeTestClient,
    TEST_APP_ID,
    TEST_FUNCTION_ID,
    TEST_SOURCE_ID,
)
from server.main import app
import pytest
import re

client = TestClient(app)

TEST_ADMIN_EMAIL = "jon+100@dropbase.io"
TEST_DEV_EMAIL = "jon+101@dropbase.io"
TEST_USER_EMAIL = "jon+102@dropbase.io"
TEST_MEMBER_EMAIL = "jon+103@dropbase.io"


def get_client(email):
    data = {"email": email, "password": "Password1"}
    client.get("/user/login")
    login_response = client.post("/user/login", json=data)

    assert login_response.status_code == 200
    cookies = login_response.headers.get("set-cookie")
    access_token = get_access_token(cookies)
    home_client = HomeTestClient(client, access_token)
    return home_client


@pytest.fixture(scope="session")
def admin_client() -> HomeTestClient:
    return get_client(email=TEST_ADMIN_EMAIL)


@pytest.fixture(scope="session")
def dev_client() -> HomeTestClient:
    return get_client(email=TEST_DEV_EMAIL)


@pytest.fixture(scope="session")
def user_client() -> HomeTestClient:
    return get_client(email=TEST_USER_EMAIL)


def get_access_token(input_string):
    access_token_match = re.search(r"access_token_cookie=([^;]+)", input_string)
    if access_token_match:
        return access_token_match.group(1)
    return None


# --------ADMIN TESTS--------#


def test_admin_can_create_delete_app(admin_client):
    response = admin_client.create_app()
    assert response.status_code == 200

    # Endpoint is broken
    # response = edit_app(user_with_admin_role_token, response.json().get("app").get("id"))
    # assert response.status_code == 200

    delete_response = admin_client.delete_app(response.json().get("app").get("id"))
    assert delete_response.status_code == 200


def test_admin_can_create_edit_delete_function(admin_client):
    response = admin_client.create_function()
    assert response.status_code == 200

    response = admin_client.edit_function(response.json().get("id"))
    assert response.status_code == 200

    delete_response = admin_client.delete_function(response.json().get("id"))
    assert delete_response.status_code == 200


def test_admin_can_create_edit_delete_widget(admin_client):
    response = admin_client.create_widget()
    assert response.status_code == 200

    response = admin_client.edit_widget(response.json().get("id"))
    assert response.status_code == 200

    delete_response = admin_client.delete_widget(response.json().get("id"))
    assert delete_response.status_code == 200


# TODO: Does not get response from create table
# def test_admin_can_create_table(admin_client):
#     response = admin_client.create_table()
#     assert response.status_code == 200

# response = admin_client.edit_table(response.json().get("id"))
# assert response.status_code == 200

# delete_response = admin_client.delete_table(response.json().get("id"))
# assert delete_response.status_code == 200


def test_admin_can_update_columns(admin_client):
    response = admin_client.update_columns_visible(True)
    assert response.status_code == 200

    admin_client.update_columns_visible(False)


def test_admin_can_create_delete_sources(admin_client):
    response = admin_client.create_source()
    assert response.status_code == 200

    # response = admin_client.edit_source(response.json().get("id"))
    # assert response.status_code == 200

    delete_response = admin_client.delete_source(response.json().get("id"))
    assert delete_response.status_code == 200


# --------DEV TESTS--------#


def test_dev_can_create_delete_app(dev_client):
    response = dev_client.create_app()
    assert response.status_code == 200

    # Endpoint is broken
    # response = edit_app(user_with_admin_role_token, response.json().get("app").get("id"))
    # assert response.status_code == 200

    delete_response = dev_client.delete_app(response.json().get("app").get("id"))
    assert delete_response.status_code == 200


def test_dev_can_create_edit_delete_function(dev_client):
    response = dev_client.create_function()
    assert response.status_code == 200

    response = dev_client.edit_function(response.json().get("id"))
    assert response.status_code == 200

    delete_response = dev_client.delete_function(response.json().get("id"))
    assert delete_response.status_code == 200


def test_dev_can_create_edit_delete_widget(dev_client):
    response = dev_client.create_widget()
    assert response.status_code == 200

    response = dev_client.edit_widget(response.json().get("id"))
    assert response.status_code == 200

    delete_response = dev_client.delete_widget(response.json().get("id"))
    assert delete_response.status_code == 200


def test_dev_can_update_columns(dev_client):
    response = dev_client.update_columns_visible(True)
    assert response.status_code == 200

    dev_client.update_columns_visible(False)


def test_dev_can_create_delete_sources(dev_client):
    response = dev_client.create_source()
    assert response.status_code == 200

    # response = dev_client.edit_source(response.json().get("id"))
    # assert response.status_code == 200

    delete_response = dev_client.delete_source(response.json().get("id"))
    assert delete_response.status_code == 200


# --------USER TESTS--------#


@pytest.mark.skip(reason="Endpoint doesn't require workspace_id yet")
def test_user_cannot_create_app(user_client):
    response = user_client.create_app()
    assert response.status_code == 403


def test_user_cannot_delete_app(user_client):
    response = user_client.delete_app(TEST_APP_ID)
    assert response.status_code == 403


def test_user_cannot_create_function(user_client):
    response = user_client.create_function()
    assert response.status_code == 403


def test_user_cannot_edit_function(user_client):
    response = user_client.edit_function(TEST_FUNCTION_ID)
    assert response.status_code == 403


def test_user_cannot_delete_function(user_client):
    response = user_client.delete_function(TEST_FUNCTION_ID)
    assert response.status_code == 403


def test_user_cannot_create_widget(user_client):
    response = user_client.create_widget()
    assert response.status_code == 403


# def test_user_cannot_edit_widget(user_client):
#     response = user_client.edit_widget(TEST_FUNCTION_ID)
#     assert response.status_code == 403


# def test_user_cannot_delete_widget(user_client):
#     response = user_client.delete_widget(TEST_FUNCTION_ID)
#     assert response.status_code == 403


def test_user_cannot_update_columns(user_client):
    response = user_client.update_columns_visible(True)
    assert response.status_code == 403


def test_user_cannot_create_sources(user_client):
    response = user_client.create_source()
    assert response.status_code == 403


def test_user_cannot_delete_sources(user_client):
    response = user_client.delete_source(TEST_SOURCE_ID)
    assert response.status_code == 403


# --------MEMBER TESTS--------#
