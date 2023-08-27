from sqlalchemy.orm import Session

from server import crud
from server.controllers.task.compose_task_code import compose_run_code
from server.controllers.task.exec_code import exec_code
from server.schemas.task import RunCodeResponse, RunTask


def run_task(request: RunTask, db: Session):
    # TODO: catch stdout
    try:
        sqls = crud.sqls.get_page_sqls(db, page_id=request.page_id)
        # get function code
        action = crud.action.get_page_action(db, page_id=request.page_id)
        # get user input schema from ui components
        components = crud.components.get_action_component(db, action_id=action.id)
        # get table schema for row
        functions = crud.functions.get_action_functions(db, action_id=action.id)
        # package all together
        run_code = compose_run_code(sqls, components, functions, request.action, request.call_type)

        # run code
        res = exec_code(run_code, request.user_input, request.row)
        return RunCodeResponse(**res)
    except Exception as e:
        res = {
            "status": "error",
            "type": "python",
            "stdout": None,
            "result": str(e),
            "traceback": None,
        }
        return RunCodeResponse(**res)
