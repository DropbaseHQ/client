from fastapi import APIRouter, Depends, Response
from server import crud
from sqlalchemy.orm import Session
from server.utils.connect import get_db
from server.controllers.columns import update_table_columns
from server.controllers.tables.convert import call_gpt, fill_smart_cols_data
from server.schemas.worker import SyncColumnsRequest, SyncComponentsRequest
from server.schemas.tables import (
    ConvertTable,
    ReadTables,
    UpdateSmartTables,
)
from server.utils.state_context import get_state_context_payload

router = APIRouter()


@router.post("/sync/columns/")
def sync_table_columns(request: SyncColumnsRequest, response: Response, db: Session = Depends(get_db)):
    # TODO: maybe user worksapce id instead of token later, once proxy is added
    # for each table, update columns
    widget_id = None
    for table_name, columns in request.table_columns.items():
        # find table by app name, page name and column
        table = crud.tables.get_table_by_app_page_token(
            db, table_name, request.page_name, request.app_name, request.token
        )
        update_table_columns(db, table, columns, request.table_type)
        widget_id = table.widget_id

    page = crud.page.get_page_by_widget(db, widget_id=widget_id)
    # create new state and context
    return get_state_context_payload(db, page.id)


@router.post("/sync/components/")
def sync_components(request: SyncComponentsRequest, response: Response, db: Session = Depends(get_db)):
    # create new state and context
    page = crud.page.get_page_by_app_page_token(
        db, page_name=request.page_name, app_name=request.app_name, token=request.token
    )
    return get_state_context_payload(db, page.id)


@router.post("/get_smart_cols/")
def get_smart_cols(req: ConvertTable, db: Session = Depends(get_db)):
    smart_col_paths = call_gpt(req.user_sql, req.column_names, req.gpt_schema)

    # Fill smart col data before validation to get
    # primary keys along with other column metadata
    smart_cols = fill_smart_cols_data(smart_col_paths, req.db_schema)

    return {"columns": smart_cols}


@router.post("/update_smart_cols/")
def update_smart_columns(req: UpdateSmartTables, db: Session = Depends(get_db)):
    table = ReadTables(**req.table)
    columns = crud.columns.get_table_columns(db, table_id=table.id)
    col_status = {}
    for col in columns:
        if col.name in req.smart_columns:
            col.property = req.smart_columns[col.name].dict()
            col_status[col.name] = "updated"
        else:
            col_status[col.name] = "skipped"
    db.commit()
    return col_status
