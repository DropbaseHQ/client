from uuid import UUID

from fastapi import Response
from sqlalchemy.orm import Session

from server import crud
from server.controllers.tables.helper import get_table_pydantic_model
from server.controllers.task.compose_task_code import compose_run_code
from server.controllers.task.exec_code import exec_code
from server.controllers.widget.helpers import get_pydantic_model
from server.schemas.task import RunCodeResponse, RunTask


def run_task(request: RunTask, response: Response, db: Session):
    # TODO: catch stdout
    try:
        table_models = get_tables_states(db, request.page_id)
        widget = crud.widget.get_page_widget(db, page_id=request.page_id)
        widget_models = get_widget_states(db, widget.id)
        functions = crud.functions.get_page_functions(db, page_id=request.page_id)
        function_code = get_function_code(functions)
        executable_code = table_models + widget_models + function_code + "\n" + request.action

        print(executable_code)
        # run code
        res = exec_code(
            executable_code, request.state["user_input"], request.state["tables"], request.state["state"]
        )
        return RunCodeResponse(**res)
    except Exception as e:
        print(e)
        res = {
            "status": "error",
            "type": "python",
            "stdout": None,
            "result": str(e),
            "traceback": None,
        }
        response.status_code = 500
        return RunCodeResponse(**res)


def get_tables_states(db, page_id):
    tables = crud.tables.get_page_tables(db, page_id)
    # should come from state to display
    base_table_state_model = """class TableDisplayProperty(BaseModel):
    message: Optional[str]
    message_type: Optional[str]\n"""

    table_state = "class StateTables(BaseModel):\n"
    selected_row_model = "class SelectedRowTables(BaseModel):\n"

    table_row_models = []
    for table in tables:
        # get pydantic models
        model_str, model_name = get_table_pydantic_model(db, table.id)
        table_row_models.append(model_str)

        # get selected row
        selected_row_model += f"    {table.name}: {model_name}\n"

        # get table state
        table_state += f"    {table.name}: TableDisplayProperty\n"

    final_str = "from pydantic import BaseModel\n"
    final_str += "from typing import Any, Optional, Literal\n"

    for model in table_row_models:
        final_str += model

    final_str += selected_row_model
    final_str += "\n"
    final_str += base_table_state_model
    final_str += table_state

    return final_str


def get_widget_states(db, widget_id: UUID):

    widget = crud.widget.get_object_by_id_or_404(db, id=widget_id)
    components = crud.components.get_widget_component(db, widget_id)

    user_input = get_pydantic_model(db, widget_id)

    widget_components_state = "class WidgetComponents(BaseModel):\n"
    for comp in components:
        widget_components_state += f"    {comp.property['name']}: InputBaseProperties\n"

    final_str = widget_components_state

    final_str += """class InputBaseProperties(BaseModel):
    # read_only
    # ui
    name: Optional[str]
    type: Literal["text", "number", "select"]
    label: Optional[str]
    # ui logic
    required: Optional[bool]
    validation: Optional[str]
    # ui options
    default: Optional[str]
    placeholder: Optional[str]
    # ui events
    rules: Optional[List[Dict]]
    display_rules: Optional[List[Dict]]
    on_change_rules: Optional[List[Dict]]

    on_select: Optional[str]
    on_click: Optional[str]
    on_change: Optional[str]\n"""
    final_str += """class Widget(BaseModel):
    components: WidgetComponents
    message: str\n"""

    final_str += f"""class State(BaseModel):
    {widget.name}: Widget
    tables: StateTables\n"""

    final_str += user_input

    return final_str


from server.schemas.functions import ReadFunctions


def get_function_code(functions: list[ReadFunctions]):
    final_str = ""
    for func in functions:
        final_str += func.code
    return final_str
