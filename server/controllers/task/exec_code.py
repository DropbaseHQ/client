import contextlib
import inspect
import io
import traceback


def exec_code(run_code, user_input, row):
    def call_function_with_auto_arguments(func, argument_mapper):
        """Defined here so this function is available in locals()"""
        sig = inspect.signature(func)
        kwargs = {}
        for param_name, param in sig.parameters.items():
            if param.annotation in argument_mapper:
                kwargs[param_name] = argument_mapper[param.annotation]
        return func(**kwargs)

    ldic = {"result": "", "stdout": "", "traceback": "", "status": "", "type": "python", **locals()}
    stdout_ = io.StringIO()  # Create StringIO object
    try:
        with contextlib.redirect_stdout(stdout_):
            exec(run_code, ldic)
            ldic["status"] = "success"
    except Exception as e:
        ldic["result"] = str(e)
        ldic["traceback"] = traceback.format_exc()
        ldic["status"] = "error"
    ldic["stdout"] = stdout_.getvalue()  # Get stdout value
    return ldic
