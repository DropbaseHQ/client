from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.controllers import task
from server.controllers.task.edit_cell import edit_cell
from server.schemas.task import EditCell, RunTask
from server.utils.connect import get_db

router = APIRouter(prefix="/task", tags=["task"])


@router.post("/")
def run_task(request: RunTask, db: Session = Depends(get_db)):
    return task.run_task(request, db)


@router.post("/edit")
def edit_cell_task(request: EditCell, db: Session = Depends(get_db)):
    return edit_cell(db, request)
