from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.controllers import task
from server.controllers.task.edit_cell import edit_cell
from server.schemas.task import EditCell, RunFunction, RunTask
from server.utils.connect import get_db
from server.utils.authorization import RESOURCES, AuthZDepFactory


# authorize_page_actions = generate_resource_dependency(RESOURCES.PAGE)
# authorize_functions_actions = generate_resource_dependency(RESOURCES.FUNCTIONS)
# authorize_components_actions = generate_resource_dependency(RESOURCES.COMPONENTS)

task_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.TASK)
router = APIRouter(
    prefix="/task",
    tags=["task"],
    dependencies=[Depends(task_authorizer)],
)


@router.post("/", dependencies=[Depends(task_authorizer.use_params(resource_type=RESOURCES.FUNCTIONS))])
def run_task(request: RunTask, db: Session = Depends(get_db)):
    return task.run_task(request, db)


@router.post(
    "/function", dependencies=[Depends(task_authorizer.use_params(resource_type=RESOURCES.PAGE))]
)
def run_function(request: RunFunction, db: Session = Depends(get_db)):
    return task.run_function(request, db)


@router.post("/edit", dependencies=[Depends(task_authorizer.use_params(resource_type=RESOURCES.TABLE))])
def edit_cell_task(request: EditCell, db: Session = Depends(get_db)):
    return edit_cell(db, request)
