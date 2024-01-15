from fastapi.testclient import TestClient

# Constants
TEST_WORKSPACE = "4dee8d8f-c483-4ed7-9dbd-a5104f00d69f"
TEST_APP_ID = "5b4699fa-402f-4f15-936b-bcae24ea54a7"
TEST_PAGE_ID = "5f5a860e-91c1-47c8-bbaa-ca8f29d21297"
TEST_FUNCTION_ID = "cff5b62c-e504-4829-b7b6-3f5fa7e69875"
TEST_FUNCTION_ID_2 = "61c53a64-eb18-461e-b4ab-23676a10c242"
TEST_CODE = "select * from customer"
TEST_CODE_EDIT = "select * from customer limit 10"
TEST_TABLE_ID = "a90ca748-dc02-4d0e-9bbc-4411f2158e03"
TEST_COLUMN = "aa178fc3-1b9b-4ea6-a9ed-2fd2e68bde24"
TEST_GROUP = "2be7a065-d5a9-4785-b880-7e5ba53f5ca9"

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
        data = {
            "name": "test widget edit",
            "property": {"name": "test widget property edit"},
        }
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
            "property": table_property,
            "state": {},
            "type": "postgres",
        }
        response = self.client.post("/tables/", json=data)
        return response

    def edit_table(self, table_id):
        table_property = {"name": "test table edit", "code": TEST_CODE_EDIT}
        data = {
            "name": "test table edit",
            "page_id": TEST_PAGE_ID,
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

    # Groups
    def create_group(self):
        data = {
            "name": "test group",
            "workspace_id": TEST_WORKSPACE,
        }
        response = self.client.post("/group/", json=data)
        return response

    def edit_group(self, group_id):
        data = {"name": "test group edit"}
        response = self.client.put(f"/group/{group_id}", json=data)
        return response

    def delete_group(self, group_id):
        response = self.client.delete(f"/group/{group_id}")
        return response

    def add_group_policy(self, group_id, resource, action):
        data = {
            "policies": [
                {
                    "resource": resource,
                    "action": action,
                }
            ]
        }
        response = self.client.post(f"/group/add_policies/{group_id}", json=data)
        return response

    def remove_group_policy(self, group_id, resource, action):
        data = {
            "policies": [
                {
                    "resource": resource,
                    "action": action,
                }
            ]
        }
        response = self.client.post(f"/group/remove_policies/{group_id}", json=data)
        return response

    def add_user_to_group(self, group_id, user_id):
        response = self.client.post(f"/group/add_user/{group_id}", json={"user_id": user_id})
        return response

    def remove_user_from_group(self, group_id, user_id):
        response = self.client.post(f"/group/remove_user/{group_id}", json={"user_id": user_id})
        return response

    # Users
    def add_user_policy(self, user_id, resource, action):
        data = {
            "workspace_id": TEST_WORKSPACE,
            "policies": [
                {
                    "resource": resource,
                    "action": action,
                }
            ],
        }
        response = self.client.post(f"/user/add_policies/{user_id}", json=data)
        return response

    def remove_user_policy(self, user_id, resource, action):
        data = {
            "workspace_id": TEST_WORKSPACE,
            "policies": [
                {
                    "resource": resource,
                    "action": action,
                }
            ],
        }
        response = self.client.post(f"/user/remove_policies/{user_id}", json=data)
        return response
