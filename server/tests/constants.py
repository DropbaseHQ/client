import uuid
from server.credentials import (
    POSTGRES_DB_HOST,
    POSTGRES_DB_NAME,
    POSTGRES_DB_PASS,
    POSTGRES_DB_PORT,
    POSTGRES_DB_USER,
)

TEST_FILE_ORDER = {
    filename: ord
    for ord, filename
    in enumerate([
        "test_workspace.py",
        "test_user.py",
        "test_user_role.py",
        "test_app.py",
        "test_page.py",
        "test_source.py",
        "test_tables.py",
        "test_columns.py",
        "test_widget.py",
        "test_components.py",
        "test_functions.py",
    ])
}

TEST_USER_EMAIL = str(uuid.uuid4())
TEST_USER_PASSWORD = "test password"

ADMIN_ROLE_ID = "00000000-0000-0000-0000-000000000001"
DEV_ROLE_ID = "00000000-0000-0000-0000-000000000002"

MOCK_NONEXISTENT_UUID = "4d181f7d-d00a-4899-8235-1308ef20b46f"

TEST_DB_HOST = POSTGRES_DB_HOST
TEST_DB_PORT = POSTGRES_DB_PORT
TEST_DB_USER = POSTGRES_DB_USER
TEST_DB_PASS = POSTGRES_DB_PASS
TEST_DB_NAME = POSTGRES_DB_NAME
