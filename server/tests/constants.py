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
        "test_role.py",
        "test_app.py",
        "test_page.py",
        "test_columns.py",
        "test_widget.py",
        "test_components.py",
        "test_functions.py",
        "test_source.py",
    ])
}

TEST_USER_EMAIL = str(uuid.uuid4())
TEST_USER_PASSWORD = "test password"

ADMIN_ROLE_ID = "a1f129ef-3474-4aa9-93e0-2aa3ab13181c"

MOCK_NONEXISTENT_UUID = "4d181f7d-d00a-4899-8235-1308ef20b46f"

TEST_DB_HOST = POSTGRES_DB_HOST
TEST_DB_PORT = POSTGRES_DB_PORT
TEST_DB_USER = POSTGRES_DB_USER
TEST_DB_PASS = POSTGRES_DB_PASS
TEST_DB_NAME = POSTGRES_DB_NAME
