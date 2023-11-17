from uuid import UUID

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
    page_id = None
    for table_id, columns in request.table_columns.items():
        # find table by app name, page name and column
        table = crud.tables.get_object_by_id_or_404(db, id=table_id)
        if not page_id:
            page = crud.page.get_object_by_id_or_404(db, id=table.page_id)
            page_id = page.id

        update_table_columns(db, table, columns, request.table_type)

    # create new state and context
    return get_state_context_payload(db, page_id)


@router.post("/components/")
def sync_components(request: SyncComponentsRequest, response: Response, db: Session = Depends(get_db)):
    # create new state and context
    page = crud.page.get_page_by_app_page_token(
        db, page_name=request.page_name, app_name=request.app_name, token=request.token
    )
    return get_state_context_payload(db, page.id)


@router.put("/page/{page_id}")
def get_page_state_context(page_id: UUID, db: Session = Depends(get_db)):
    resp = get_state_context_payload(db, page_id)
    print(resp)
    return resp
