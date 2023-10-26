import re

import pytest
from fastapi.testclient import TestClient

from server.main import app
from server.tests.authorization.utils import (
    TEST_APP_ID,
    TEST_FUNCTION_ID,
    TEST_FUNCTION_ID_2,
    TEST_GROUP,
    HomeTestClient,
)

client = TestClient(app)

TEST_ADMIN_EMAIL = "jon+100@dropbase.io"
TEST_DEV_EMAIL = "jon+101@dropbase.io"
TEST_USER_EMAIL = "jon+102@dropbase.io"
TEST_USER_ID = "b97f49a9-b8cc-4e17-bc0f-568457f3e86c"
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


# --------MEMBER TESTS--------#


# --------GROUP TESTS--------#
def test_user_in_group_can_create_function(admin_client, user_client):
    # User is already in test group
    # Admin adds policy to group
    policy_add_response = admin_client.add_group_policy(TEST_GROUP, "page", "edit")
    assert policy_add_response.status_code == 200

    # User can now create function
    create_function = user_client.create_function()
    assert create_function.status_code == 200

    # Admin removes policy from group
    policy_remove_response = admin_client.remove_group_policy(TEST_GROUP, "page", "edit")
    assert policy_remove_response.status_code == 200

    # User can now no longer create function
    bad_create_function = user_client.create_function()
    assert bad_create_function.status_code == 403

    # Admin removes created function
    new_admin_client = get_client(email=TEST_ADMIN_EMAIL)
    delete_function = new_admin_client.delete_function(create_function.json().get("id"))
    assert delete_function.status_code == 200


def test_user_given_special_permission_can_create_function(admin_client, user_client):
    create_function = user_client.create_function()
    assert create_function.status_code == 403

    new_admin_client = get_client(email=TEST_ADMIN_EMAIL)
    policy_add_response = new_admin_client.add_user_policy(TEST_USER_ID, "page", "edit")
    assert policy_add_response.status_code == 200

    new_create_function = user_client.create_function()
    assert new_create_function.status_code == 200

    new_policy_remove_response = new_admin_client.remove_user_policy(TEST_USER_ID, "page", "edit")
    assert new_policy_remove_response.status_code == 200

    new_delete_function = new_admin_client.delete_function(new_create_function.json().get("id"))
    assert new_delete_function.status_code == 200


def test_user_can_edit_specific_function(user_client):
    # User is already in test group
    edit_response = user_client.edit_function(TEST_FUNCTION_ID)
    assert edit_response.status_code == 403

    # Admin adds policy to user
    new_admin_client = get_client(email=TEST_ADMIN_EMAIL)
    policy_add_response = new_admin_client.add_user_policy(TEST_USER_ID, TEST_FUNCTION_ID, "edit")
    assert policy_add_response.status_code == 200

    # User can now edit function
    new_user_client = get_client(email=TEST_USER_EMAIL)
    new_edit_response = new_user_client.edit_function(TEST_FUNCTION_ID)
    assert new_edit_response.status_code == 200

    # User cannot edit other function

    bad_edit_response = new_user_client.edit_function(TEST_FUNCTION_ID_2)
    assert bad_edit_response.status_code == 403

    # Admin removes policy from user
    new_admin_client = get_client(email=TEST_ADMIN_EMAIL)
    policy_remove_response = new_admin_client.remove_user_policy(TEST_USER_ID, TEST_FUNCTION_ID, "edit")
    assert policy_remove_response.status_code == 200

    # User can now no longer edit function
    new_user_client = get_client(email=TEST_USER_EMAIL)
    bad_edit_response = new_user_client.edit_function(TEST_FUNCTION_ID)
    assert bad_edit_response.status_code == 403
