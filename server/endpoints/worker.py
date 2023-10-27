# for calls from worker
# TODO: hide behind protected route
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from server import crud
from server.controllers.columns import update_table_columns
from server.controllers.state.state import get_state_context
from server.schemas.worker import SyncColumnsRequest, SyncComponentsRequest
from server.utils.connect import get_db

router = APIRouter(prefix="/worker", tags=["worker"])


@router.post("/sync/columns/")
def sync_table_columns(request: SyncColumnsRequest, response: Response, db: Session = Depends(get_db)):

    # TODO: maybe user worksapce id instead of token later, once proxy is added
    # for each table, update columns
    for table_name, columns in request.table_columns.items():
        # find table by app name, page name and column
        table = crud.tables.get_table_by_app_page_token(
            db, table_name, request.page_name, request.app_name, request.token
        )
        update_table_columns(db, table, columns)

    # create new state and context
    State, Context = get_state_context(db, table.page_id)
    response = {"state": State.schema(), "context": Context.schema(), "status": "success"}
    return response


@router.post("/sync/components/")
def sync_components(request: SyncComponentsRequest, response: Response, db: Session = Depends(get_db)):
    # create new state and context
    page = crud.page.get_page_by_app_page_token(
        db, page_name=request.page_name, app_name=request.app_name, token=request.token
    )
    State, Context = get_state_context(db, page.id)
    response = {"state": State.schema(), "context": Context.schema(), "status": "success"}
    return response
