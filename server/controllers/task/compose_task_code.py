from typing import List

from server.schemas.components import ReadComponents
from server.schemas.functions import ReadFunctions
from server.schemas.sqls import ReadSQLs


def compose_run_code(
    sqls: List[ReadSQLs], components: ReadComponents, functions: ReadFunctions, action: str
) -> str:
    run_code = "from dataclasses import dataclass\n"
    run_code += "from dacite import from_dict\n"
    run_code += "import stripe\n\n"
    run_code += sqls[0].dataclass + "\n\n"
    run_code += components.dataclass + "\n\n"

    for func in functions:
        run_code += func.code + "\n\n"

    run_code += """row = from_dict(data_class=Row, data=row)\n"""
    run_code += """user_input=UserInput(**user_input)\n\n"""

    run_code += f"""result = {action}(user_input, row)"""
    return run_code
