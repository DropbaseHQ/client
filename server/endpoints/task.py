from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.controllers import task
from server.schemas.task import RunFunction, RunTask
from server.utils.authorization import ACTIONS, RESOURCES, AuthZDepFactory
from server.utils.connect import get_db

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
    "/function",
    dependencies=[Depends(task_authorizer.use_params(resource_type=RESOURCES.PAGE, action=ACTIONS.USE))],
)
def run_function(request: RunFunction, db: Session = Depends(get_db)):
    return task.run_function(request, db)
