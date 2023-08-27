from fastapi.testclient import TestClient

from server.main import app

client = TestClient(app)

from server import crud
from server.tests.conftest import ValueStorage
from server.utils.connect import get_db

db = next(get_db())


user_input_str = """@dataclass
class UserInput:
     name: str
     age: int"""

row_str = """@dataclass
class Row:
     name: str
     email: str"""


function_str = """def action(user_input: UserInput, row: Row):
    return user_input.name"""


def test_run_task():

    # get user input schema from ui components
    components = crud.components.get_action_component(db, app_id=ValueStorage.app_id)
    components.dataclass = user_input_str

    # get table schema for row
    sqls = crud.sqls.get_page_sqls(db, app_id=ValueStorage.app_id)
    sqls[0].dataclass = row_str

    # get function code
    functions = crud.functions.get_action_functions(db, app_id=ValueStorage.app_id)
    functions[0].code = function_str

    db.commit()

    data = {
        "app_id": ValueStorage.app_id,
        "user_input": {"name": "zaza", "age": 12},
        "row": {"name": "az", "email": "az@as.cd"},
        "action": "action",
    }
    response = client.post("/task/", json=data)
    assert response.json() == "zaza"
    assert response.status_code == 200
