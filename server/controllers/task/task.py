from sqlalchemy.orm import Session

from server import crud
from server.controllers.task.compose_task_code import compose_run_code
from server.controllers.task.exec_code import exec_code
from server.schemas.task import RunCodeResponse, RunTask


def run_task(request: RunTask, db: Session):
    # TODO: catch stdout
    try:
        # get user input schema from ui components
        components = crud.components.get_app_component(db, app_id=request.app_id)
        # get table schema for row
        sqls = crud.sqls.get_app_sqls(db, app_id=request.app_id)
        # get function code
        functions = crud.functions.get_app_functions(db, app_id=request.app_id)
        # package all together
        run_code = compose_run_code(sqls, components, functions, request.action, request.call_type)

        # run code
        res = exec_code(run_code, request.user_input, request.row)
        return RunCodeResponse(**res)
    except Exception as e:
        print(e)
        return RunCodeResponse(**res)
