from typing import List

from server.schemas.components import ReadComponents
from server.schemas.functions import ReadFunctions
from server.schemas.sqls import ReadSQLs
from server.schemas.task import RunTask


def compose_run_code(
    sqls: List[ReadSQLs], components: ReadComponents, functions: ReadFunctions, action: str
) -> str:
    run_code = "from dataclasses import dataclass\n\n"
    run_code += sqls[0].dataclass + "\n\n"
    run_code += components.dataclass + "\n\n"

    for func in functions:
        run_code += func.code + "\n\n"

    run_code += """row = Row(**row_json)\n"""
    run_code += """user_input=UserInput(**user_input_json)\n\n"""

    run_code += f"""result = {action}(user_input, row)"""
    return run_code
