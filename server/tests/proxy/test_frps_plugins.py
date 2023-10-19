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
TEST_API_TOKEN = "test-token"


def get_client(email):
    data = {"email": email, "password": "Password1"}
    client.get("/user/login")
    login_response = client.post("/user/login", json=data)

    assert login_response.status_code == 200
    cookies = login_response.headers.get("set-cookie")
    access_token = get_access_token(cookies)
    client.cookies = {"access_token_cookie": access_token}
    return client


@pytest.fixture(scope="session")
def admin_client() -> TestClient:
    return get_client(email=TEST_ADMIN_EMAIL)


def get_access_token(input_string):
    access_token_match = re.search(r"access_token_cookie=([^;]+)", input_string)
    if access_token_match:
        return access_token_match.group(1)
    return None


# --------SERVER PLUGIN TESTS--------#


def test_auth_tunnel_op_login(admin_client: TestClient):
    # Arrange
    data = {
        "version": "0.1.0",
        "op": "Login",
        "content": {
            "version": "0.52.0",
            "os": "darwin",
            "arch": "arm64",
            "privilege_key": "439b53f19a71cf650277741ee00b1cef",
            "timestamp": 1697747215,
            "metas": {"token": "test-token"},
            "pool_count": 1,
            "admin_client_address": "127.0.0.1:49848"
        }
    }
    url = "/tunnel/auth"

    # Act
    res = admin_client.post(url, json=data)

    # Assert
    assert res.status_code == 200
    assert not res.json().get("reject", False)


@pytest.mark.parametrize("op", [
    "NewProxy",
    "CloseProxy",
    "Ping",
    "NewWorkConn",
    "NewUserConn",
])
def test_auth_tunnel_op(admin_client: TestClient, op):
    # Arrange
    data = {
        "version": "0.1.0",
        "op": op,
        "content": {
            "user": {
                "metas": {"token": "test-token"}
            }
        }
    }
    url = "/tunnel/auth"

    # Act
    res = admin_client.post(url, json=data)

    # Assert
    assert res.status_code == 200
    assert not res.json().get("reject", False)


def test_auth_tunnel_op_login_invalid_token(admin_client: TestClient):
    # Arrange
    data = {
        "version": "0.1.0",
        "op": "Login",
        "content": {
            "version": "0.52.0",
            "os": "darwin",
            "arch": "arm64",
            "privilege_key": "439b53f19a71cf650277741ee00b1cef",
            "timestamp": 1697747215,
            "metas": {"token": "invalid token"},
            "pool_count": 1,
            "admin_client_address": "127.0.0.1:49848"
        }
    }
    url = "/tunnel/auth"

    # Act
    res = admin_client.post(url, json=data)

    # Assert
    assert res.status_code == 200
    assert res.json().get("reject", False)


@pytest.mark.parametrize("op", [
    "NewProxy",
    "CloseProxy",
    "Ping",
    "NewWorkConn",
    "NewUserConn",
])
def test_auth_tunnel_op_invalid_token(admin_client: TestClient, op):
    # Arrange
    data = {
        "version": "0.1.0",
        "op": op,
        "content": {
            "user": {
                "metas": {"token": "invalid token"}
            }
        }
    }
    url = "/tunnel/auth"

    # Act
    res = admin_client.post(url, json=data)

    # Assert
    assert res.status_code == 200
    assert res.json().get("reject", False)


@pytest.mark.parametrize("tunnel_type", ["worker", "lsp"])
def test_new_tunnel_op(admin_client: TestClient, tunnel_type):
    # Arrange
    data = {
        "version": "0.1.0",
        "op": "NewProxy",
        "content": {
            "user": {
                "user": "",
                "metas": {"token": "test-token"},
                "run_id": "4892215d67efdf26"}
            ,
            "proxy_name": f"test-token/{tunnel_type}",
            "proxy_type": "tcp"
        }
    }
    url = "/tunnel/new"

    # Act
    res = admin_client.post(url, json=data)

    # Assert
    assert res.status_code == 200
    assert not res.json().get("reject", False)


def test_new_tunnel_invalid_type(admin_client: TestClient):
    # Arrange
    data = {
        "version": "0.1.0",
        "op": "NewProxy",
        "content": {
            "user": {
                "user": "",
                "metas": {"token": "test-token"},
                "run_id": "4892215d67efdf26"}
            ,
            "proxy_name": f"test-token/not_worker_or_lsp",
            "proxy_type": "tcp"
        }
    }
    url = "/tunnel/new"

    # Act
    res = admin_client.post(url, json=data)

    # Assert
    assert res.status_code == 200
    assert res.json().get("reject", False)


def test_ping_tunnel_op(admin_client: TestClient):
    # Arrange
    data = {
        "version": "0.1.0",
        "op": "Ping",
        "content": {
            "user": {
                "user": "",
                "metas": {"token": "test-token"},
                "run_id": "4892215d67efdf26"
            }
        }
    }
    url = "/tunnel/ping"

    # Act
    res = admin_client.post(url, json=data)

    # Assert
    assert res.status_code == 200
    assert not res.json().get("reject", False)


def test_ping_tunnel_op_not_found(admin_client: TestClient):
    # Arrange
    data = {
        "version": "0.1.0",
        "op": "Ping",
        "content": {
            "user": {
                "user": "",
                "metas": {"token": "invalid_token"},
                "run_id": "4892215d67efdf26"
            }
        }
    }
    url = "/tunnel/ping"

    # Act
    res = admin_client.post(url, json=data)

    # Assert
    assert res.status_code == 200
    assert res.json().get("reject", False)


def test_ping_tunnel_op_invalid_token(admin_client: TestClient):
    # Arrange
    data = {
        "version": "0.1.0",
        "op": "Ping",
        "content": {
            "user": {
                "user": "",
                "metas": {"token": "invalid token"},
                "run_id": "4892215d67efdf26"
            }
        }
    }
    url = "/tunnel/ping"

    # Act
    res = admin_client.post(url, json=data)

    # Assert
    assert res.status_code == 200
    assert res.json().get("reject", False)


@pytest.mark.parametrize("tunnel_type", ["worker", "lsp"])
def test_close_tunnel_op(admin_client: TestClient, tunnel_type):
    # Arrange
    data = {
        "version": "0.1.0",
        "op": "CloseProxy",
        "content": {
            "user": {
                "user": "",
                "metas": {"token": "test-token"},
                "run_id": "41e08bd2e9c07b18"
            },
            "proxy_name": f"test-token/{tunnel_type}"
        }
    }
    url = "/tunnel/close"

    # Act
    res = admin_client.post(url, json=data)

    # Assert
    assert res.status_code == 200
    assert not res.json().get("reject", False)


def test_close_tunnel_op_does_not_exist(admin_client: TestClient):
    # Arrange
    data = {
        "version": "0.1.0",
        "op": "CloseProxy",
        "content": {
            "user": {
                "user": "",
                "metas": {"token": "test-token"},
                "run_id": "41e08bd2e9c07b18"
            },
            "proxy_name": f"test-token/nonexistenttunnel"
        }
    }
    url = "/tunnel/close"

    # Act
    res = admin_client.post(url, json=data)

    # Assert
    assert res.status_code == 200
    assert res.json().get("reject", False)


def test_close_tunnel_op_invalid_token(admin_client: TestClient):
    # Arrange
    data = {
        "version": "0.1.0",
        "op": "CloseProxy",
        "content": {
            "user": {
                "user": "",
                "metas": {"token": "invalid token"},
                "run_id": "41e08bd2e9c07b18"
            },
            "proxy_name": "test-token/lsp"
        }
    }
    url = "/tunnel/close"

    # Act
    res = admin_client.post(url, json=data)

    # Assert
    assert res.status_code == 200
    assert res.json().get("reject", False)
