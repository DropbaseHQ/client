import inspect

from sqlalchemy.orm import Session

from server import crud
from server.controllers.task.compose_task_code import compose_run_code
from server.schemas.task import RunFunction, RunTask


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
        run_code = compose_run_code(sqls, components, functions, request.action)

        # run code
        res = run_task_from_code_string(run_code, request.user_input, request.row)
        return {"message": "success", "data": res, "error": ""}
    except Exception as e:
        temp_error = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nSed id interdum diam. Nunc volutpat egestas maximus.\nProin in massa vitae lacus bibendum commodo sit amet ac ipsum.\nInterdum et malesuada fames ac ante ipsum primis in faucibus.\nEtiam molestie luctus tortor sit amet ornare.\nPellentesque sit amet lorem condimentum, ullamcorper justo vitae, posuere velit. Quisque vulputate aliquet augue."
        return {
            "message": "fail",
            "data": str(e) + "\n\n" + temp_error,
            "error": f"Failed to run {request.action}",
        }


def run_function_call(request: RunFunction, db: Session):
    try:
        # get user input schema from ui components
        components = crud.components.get_app_component(db, app_id=request.app_id)
        # get table schema for row
        sqls = crud.sqls.get_app_sqls(db, app_id=request.app_id)
        # get function code
        functions = crud.functions.get_app_functions(db, app_id=request.app_id)
        # package all together
        run_code = compose_run_code(sqls, components, functions, request.function_call, "function_call")

        # run code
        res = run_task_from_code_string(run_code, request.user_input, request.row)

        return {"message": "success", "data": res, "error": ""}
    except Exception as e:
        temp_error = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nSed id interdum diam. Nunc volutpat egestas maximus.\nProin in massa vitae lacus bibendum commodo sit amet ac ipsum.\nInterdum et malesuada fames ac ante ipsum primis in faucibus.\nEtiam molestie luctus tortor sit amet ornare.\nPellentesque sit amet lorem condimentum, ullamcorper justo vitae, posuere velit. Quisque vulputate aliquet augue."
        return {
            "message": "fail",
            "data": str(e) + "\n\n" + temp_error,
            "error": f"Failed to run {request.function_call}",
        }


def run_task_from_code_string(run_code, user_input, row):
    # noqa
    def call_function_with_auto_arguments(func, argument_mapper):
        """Defined here so this function is available in locals()"""
        sig = inspect.signature(func)
        kwargs = {}
        for param_name, param in sig.parameters.items():
            if param.annotation in argument_mapper:
                kwargs[param_name] = argument_mapper[param.annotation]
        return func(**kwargs)

    ldic = locals()
    exec(run_code, ldic)
    return ldic["result"]


def run_function(exec_code: str, function_name: str):
    # user_code = """result = get_plans(row, user_input, local_data)"""
    ldic = globals()
    exec(exec_code, ldic)
    return ldic["result"]
