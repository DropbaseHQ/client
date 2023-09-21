from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.utils.find_functions import get_function_names


def get_ui_functions(db: Session, page_id: UUID):
    functions = crud.functions.get_page_functions(db, page_id=page_id)
    functions_code = [func.code for func in functions]
    function_string = "\n".join(functions_code)
    function_names = get_function_names(function_string)
    return list(function_names.keys())
