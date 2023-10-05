from fastapi.testclient import TestClient

from server.main import app
import pytest

# Constants
TEST_WORKSPACE = "4dee8d8f-c483-4ed7-9dbd-a5104f00d69f"
TEST_APP_ID = "5b4699fa-402f-4f15-936b-bcae24ea54a7"
TEST_PAGE_ID = "5f5a860e-91c1-47c8-bbaa-ca8f29d21297"
TEST_FUNCTION_ID = "cff5b62c-e504-4829-b7b6-3f5fa7e69875"
TEST_SOURCE_ID = "c6bd8b77-8ba9-4296-8953-ba95e89aac92"  # source1 id
TEST_CODE = "select * from customer"
TEST_CODE_EDIT = "select * from customer limit 10"
TEST_TABLE_ID = "a90ca748-dc02-4d0e-9bbc-4411f2158e03"
TEST_COLUMN = "aa178fc3-1b9b-4ea6-a9ed-2fd2e68bde24"

TEST_DB_HOST = "dropbase-dev.cvprjrvvsnqi.us-east-1.rds.amazonaws.com"
TEST_DB_NAME = "replica"
TEST_DB_USER = "dropbase"
TEST_DB_PASS = "cXhw9DyumxDoIsh4PQ6z"
TEST_DB_PORT = 5432


class HomeTestClient:
    def __init__(self, client: TestClient, access_token: str):
        self.access_token = access_token
        self.client = client
        self.client.cookies = {"access_token_cookie": access_token}

    # Apps
    def create_app(self):
        data = {"name": "test app", "description": "test app description"}
        response = self.client.post("/app/", json=data)
        return response

    def delete_app(self, app_id):
        response = self.client.delete(f"/app/{app_id}")
        return response

    def edit_app(self, app_id):
        data = {"name": "test app edit"}
        response = self.client.put(f"/app/{app_id}", json=data)
        return response

    # Functions
    def create_function(self):
        data = {"name": "test function", "page_id": TEST_PAGE_ID, "code": ""}
        response = self.client.post("/functions/", json=data)
        return response

    def edit_function(self, function_id):
        data = {"name": "test function edit", "code": "edit code", "test_code": "edit test code"}
        response = self.client.put(f"/functions/{function_id}", json=data)
        return response

    def delete_function(self, function_id):
        response = self.client.delete(f"/functions/{function_id}")
        return response

    # Widget
    def create_widget(self):
        data = {
            "name": "test widget",
            "page_id": TEST_PAGE_ID,
            "property": {"name": "test widget property"},
        }
        response = self.client.post("/widget/", json=data)
        return response

    def edit_widget(self, widget_id):
        data = {"name": "test widget edit", "property": {"name": "test widget property edit"}}
        response = self.client.put(f"/widget/{widget_id}", json=data)
        return response

    def delete_widget(self, widget_id):
        response = self.client.delete(f"/widget/{widget_id}")
        return response

    # Tables
    def create_table(self):
        table_property = {"name": "test table", "code": TEST_CODE}
        data = {
            "name": "test table",
            "page_id": TEST_PAGE_ID,
            "source_id": TEST_SOURCE_ID,
            "property": table_property,
            "state": {},
            "type": "postgres",
        }
        response = self.client.post("/tables/", json=data)
        print("responsex", response.content)
        return response

    def edit_table(self, table_id):
        table_property = {"name": "test table edit", "code": TEST_CODE_EDIT}
        data = {
            "name": "test table edit",
            "page_id": TEST_PAGE_ID,
            "source_id": TEST_SOURCE_ID,
            "property": table_property,
        }
        response = self.client.put(f"/tables/{table_id}", json=data)
        return response

    def delete_table(self, table_id):
        response = self.client.delete(f"/tables/{table_id}")
        return response

    # Columns
    def update_columns_visible(self, visible: bool):
        data = {
            "property": {
                "name": "id",
                "type": None,
                "unique": False,
                "default": None,
                "visible": visible,
                "editable": False,
                "nullable": True,
                "edit_keys": [],
                "table_name": None,
                "column_name": None,
                "foreign_key": False,
                "primary_key": False,
                "schema_name": None,
            },
            "name": "id",
            "type": "postgres",
            "id": "aa178fc3-1b9b-4ea6-a9ed-2fd2e68bde24",
            "table_id": "a90ca748-dc02-4d0e-9bbc-4411f2158e03",
            "date": "2023-10-03T20:37:53.566633",
        }
        response = self.client.put(f"/columns/{TEST_COLUMN}", json=data)
        return response

    # Sources
    def create_source(self):
        data = {
            "name": "test source",
            "workspace_id": TEST_WORKSPACE,
            "type": "postgres",
            "creds": {
                "host": TEST_DB_HOST,
                "port": TEST_DB_PORT,
                "database": TEST_DB_NAME,
                "username": TEST_DB_USER,
                "password": TEST_DB_PASS,
            },
        }
        response = self.client.post("/source/", json=data)
        return response

    def edit_source(self, source_id):
        data = {"name": "test source edit"}
        response = self.client.put(f"/source/{source_id}", json=data)
        return response

    def delete_source(self, source_id):
        response = self.client.delete(f"/source/{source_id}")
        return response
