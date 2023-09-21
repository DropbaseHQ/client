from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.controllers import task
from server.controllers.task.edit_cell import edit_cell
from server.schemas.task import EditCell, RunFunction, RunTask
from server.utils.connect import get_db
from server.utils.authorization import generate_resource_dependency, RESOURCES


authorize_page_actions = generate_resource_dependency(RESOURCES.PAGE)
authorize_functions_actions = generate_resource_dependency(RESOURCES.FUNCTIONS)
authorize_components_actions = generate_resource_dependency(RESOURCES.COMPONENTS)
router = APIRouter(
    prefix="/task",
    tags=["task"],
    dependencies=[
        Depends(authorize_page_actions),
        Depends(authorize_functions_actions),
        Depends(authorize_components_actions),
    ]
)


@router.post("/")
def run_task(request: RunTask, db: Session = Depends(get_db)):
    return task.run_task(request, db)


@router.post("/function")
def run_function(request: RunFunction, db: Session = Depends(get_db)):
    return task.run_function(request, db)


@router.post("/edit")
def edit_cell_task(request: EditCell, db: Session = Depends(get_db)):
    return edit_cell(db, request)
