from uuid import UUID

from fastapi import Response
from sqlalchemy.orm import Session

from server import crud
from server.controllers.tables.helper import get_table_pydantic_model
from server.controllers.task.exec_code import exec_code
from server.controllers.widget.helpers import get_pydantic_model
from server.schemas.functions import ReadFunctions
from server.schemas.tables import ReadTables
from server.schemas.task import RunCodeResponse, RunTask
from server.utils.helper import clean_name_for_class


def run_task(request: RunTask, response: Response, db: Session):
    # TODO: catch stdout
    try:
        states_def = file_to_text("server/schemas/states.py")
        table_models = get_tables_states(db, request.page_id)
        widget = crud.widget.get_page_widget(db, page_id=request.page_id)
        widget_models = get_widget_states(db, widget.id)
        functions = crud.functions.get_page_functions(db, page_id=request.page_id)
        function_code = get_function_code(functions)

        tables = request.state["tables"]
        user_input = request.state["user_input"]
        state = request.state["state"]

        casted_inputs = cast_to_classes(user_input, tables, state)
        executable_code = (
            states_def
            + table_models
            + widget_models
            + function_code
            + casted_inputs
            + "\n"
            + request.action
        )
        print(executable_code)

        # run code
        res = exec_code(executable_code, user_input, tables, state)
        return RunCodeResponse(**res)
        # return res['result']
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


def file_to_text(file_path):
    text_file = open(file_path, "r")
    data = text_file.read()
    text_file.close()
    return data


def cast_to_classes(user_input, tables, state):
    final_str = """
user_input  = UserInput(**user_input) if user_input else UserInput()
tables = TableSelection(**tables) if tables else TableSelection()
state = State(**state)\n"""
    return final_str


def get_function_code(functions: list[ReadFunctions]):
    final_str = ""
    for func in functions:
        final_str += func.code
    return final_str


def get_widget_states(db, widget_id: UUID):

    widget = crud.widget.get_object_by_id_or_404(db, id=widget_id)
    components = crud.components.get_widget_component(db, widget_id)

    user_input = get_pydantic_model(db, widget_id)

    widget_components_state = "class WidgetComponents(BaseModel):\n"

    for comp in components:
        widget_components_state += f"    {comp.property['name']}: InputStateProperties\n"

    final_str = widget_components_state

    # TODO: get this from schemas
    final_str += """class WidgetState(WidgetDisplayProperty):
    components: WidgetComponents\n"""
    # TODO: this is to handle nested

    final_str += f"""class WidgetBase(BaseModel):
    {widget.name}: WidgetState\n"""

    final_str += """class State(BaseModel):
    widget: WidgetBase
    tables: StateTables\n"""

    final_str += user_input

    return final_str


def get_display_props(db, table: ReadTables):
    table_name = clean_name_for_class(table.name)

    table_state_columns = f"class {table_name}Columns(BaseModel):\n"
    columns = crud.columns.get_table_columns(db, table.id)
    for col in columns:
        table_state_columns += f"    {col.name}: PgColumnStateProperty\n"
    table_state_columns += "\n\n"

    base_table_state_model = f"""class {table_name}TableStateProperty(TableDisplayProperty):
    columns: {table_name}Columns\n\n\n"""

    return table_state_columns + base_table_state_model, table_name + "TableStateProperty"


def get_tables_states(db, page_id):
    tables = crud.tables.get_page_tables(db, page_id)

    table_ui_state = "class StateTables(BaseModel):\n"
    selected_row_model = "class TableSelection(BaseModel):\n"

    all_ui_states = []
    all_selected_row_models = []

    for table in tables:
        table_ui_classes, talbe_ui_class_name = get_display_props(db, table)
        table_ui_state += f"    {table.name}: {talbe_ui_class_name}\n"
        pyd_model_str, pyd_model_name = get_table_pydantic_model(db, table.id)
        selected_row_model += f"    {table.name}: Optional[{pyd_model_name}]\n"
        all_selected_row_models.append(pyd_model_str)
        all_ui_states.append(table_ui_classes)

    final_str = ""

    for ui_state in all_ui_states:
        final_str += ui_state + "\n\n"
    final_str += table_ui_state + "\n\n"

    for row_model in all_selected_row_models:
        final_str += row_model + "\n\n"
    final_str += selected_row_model + "\n\n"

    return final_str
