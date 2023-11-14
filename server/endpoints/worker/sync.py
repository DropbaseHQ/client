from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from server import crud
from server.controllers.columns import update_table_columns
from server.schemas.worker import SyncColumnsRequest, SyncComponentsRequest
from server.utils.connect import get_db
from server.utils.state_context import get_state_context_payload

router = APIRouter(prefix="/sync", tags=["sync"])


@router.post("/columns/")
def sync_table_columns(request: SyncColumnsRequest, response: Response, db: Session = Depends(get_db)):
    widget_id = None
    for table_id, columns in request.table_columns.items():
        # find table by app name, page name and column
        table = crud.tables.get_object_by_id_or_404(db, id=table_id)
        update_table_columns(db, table, columns, request.table_type)

    page = crud.page.get_page_by_widget(db, widget_id=widget_id)
    # create new state and context
    return get_state_context_payload(db, page.id)


@router.post("/components/")
def sync_components(request: SyncComponentsRequest, response: Response, db: Session = Depends(get_db)):
    # create new state and context
    page = crud.page.get_page_by_app_page_token(
        db, page_name=request.page_name, app_name=request.app_name, token=request.token
    )
    return get_state_context_payload(db, page.id)