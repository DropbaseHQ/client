from fastapi.testclient import TestClient

from server.main import app
from server.tests.authorization.utils import (
    HomeTestClient,
    TEST_APP_ID,
    TEST_FUNCTION_ID,
    TEST_FUNCTION_ID_2,
    TEST_SOURCE_ID,
    TEST_GROUP,
)
import pytest
import re


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
def client() -> TestClient:
    return get_client(email=TEST_ADMIN_EMAIL).client


def get_access_token(input_string):
    access_token_match = re.search(r"access_token_cookie=([^;]+)", input_string)
    if access_token_match:
        return access_token_match.group(1)
    return None


# --------_FRPClientManager TESTS--------#
