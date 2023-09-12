import contextlib
import io
import traceback

helper_funcs = """def check_if_state(result):
    return True if isinstance(result, State) else False"""


def exec_code(user_code, test_code, user_input, tables, state):
    test_code_cleaned = compose_test_function_str(test_code)
    run_code = "\n\n".join([helper_funcs, user_code, test_code_cleaned])
    ldic = {
        "result": "",
        "is_state": False,
        "stdout": "",
        "traceback": "",
        "status": "",
        "type": "python",
        **locals(),
    }
    stdout_ = io.StringIO()  # Create StringIO object
    try:
        with contextlib.redirect_stdout(stdout_):
            exec(run_code, ldic)
            if type(ldic["result"]).__name__ == "State":
                ldic["result"] = ldic["result"].dict()
            ldic["status"] = "success"
    except Exception as e:
        ldic["result"] = str(e)
        ldic["traceback"] = traceback.format_exc()
        ldic["status"] = "error"
    ldic["stdout"] = stdout_.getvalue()  # Get stdout value
    return ldic


import ast


def get_targets(node):
    if isinstance(node, ast.Name):
        return [node.id]
    elif isinstance(node, ast.Tuple):
        return [el.id for el in node.elts if isinstance(el, ast.Name)]
    else:
        return []


def identify_instruction(instr):
    try:
        tree = ast.parse(instr.strip())
    except Exception as e:
        print(e)
        return "Invalid", []

    if isinstance(tree.body[0], ast.Assign):
        assigns_to = []
        for target in tree.body[0].targets:
            assigns_to.extend(get_targets(target))
        return "assignment", assigns_to
    elif isinstance(tree.body[0], ast.Expr):
        if isinstance(tree.body[0].value, ast.Call):
            return "function", []
        elif isinstance(tree.body[0].value, ast.Name):
            return "variable", [tree.body[0].value.id]
    else:
        return "other", []


def compose_test_function_str(user_code):
    # remove trailing spaces and newlines
    user_code = user_code.strip("\n ")
    # split into lines
    lines = user_code.split("\n")

    line_type, variables = identify_instruction(lines[-1])

    if line_type == "function":
        lines[-1] = f"result = {lines[-1]}"
        lines.append("is_state = check_if_state(result)")

    elif line_type == "assignment" and len(variables) > 0:
        if len(variables) > 1:
            lines.append(f"result = ({','.join(variables)})")
            lines.append("is_state = False")
        else:
            lines.append(f"result = {variables[0]}")
            lines.append("is_state = check_if_state(result)")
    elif line_type == "variable" and len(variables) > 0:
        if len(variables) > 1:
            lines.append(f"result = ({','.join(variables)})")
            lines.append("is_state = False")
        else:
            lines.append(f"result = {variables[0]}")
            lines.append("is_state = check_if_state(result)")
    else:
        lines.append("is_state = False")
        lines[-1] = "result = None"

    user_code = "\n".join(lines)
    return user_code
