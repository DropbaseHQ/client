from typing import List, Literal

from server.schemas.components import ReadComponents
from server.schemas.functions import ReadFunctions
from server.schemas.sqls import ReadSQLs


def compose_run_code(
    sqls: List[ReadSQLs],
    components: ReadComponents,
    functions: ReadFunctions,
    action: str,
    call_type: Literal["task", "function"],
) -> str:
    run_code = "from dataclasses import dataclass\n"
    run_code += "from dacite import from_dict\n"
    run_code += "import stripe\n\n"
    run_code += "import requests\n\n"
    run_code += sqls[0].dataclass + "\n\n"
    run_code += components.dataclass + "\n\n"

    for func in functions:
        run_code += func.code + "\n\n"

    run_code += """row = from_dict(data_class=Row, data=row)\n"""
    run_code += """state=State(**user_input)\n\n"""

    run_code += """argument_mapper = {
        Row: row,
        State: state,
    }\n\n"""

    # run_code += f"""result = {action}(user_input, row)"""
    if call_type == "function":
        run_code += f"result = {action}"
    else:
        run_code += f"""result = call_function_with_auto_arguments({action}, argument_mapper)"""

    return run_code
