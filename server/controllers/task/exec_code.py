import contextlib
import inspect
import io
import traceback


def exec_code(run_code, user_input, tables, state):
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
