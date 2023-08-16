from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.controllers import task
from server.schemas.task import RunTask
from server.utils.connect import get_db

router = APIRouter(prefix="/task", tags=["task"])


@router.post("/")
def run_task(request: RunTask, db: Session = Depends(get_db)):
    return task.run_task(request, db)
