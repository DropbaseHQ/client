# for calls from worker
# TODO: hide behind protected route
from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from server import crud
from server.controllers.app import finalize_app
from server.controllers.columns import update_table_columns
from server.controllers.tables.convert import call_gpt, fill_smart_cols_data
from server.schemas import FinalizeApp
from server.schemas.tables import (
    ConvertTable,
    CreateTables,
    ReadTables,
    UpdateSmartTables,
    UpdateTables,
    UpdateTablesRequest,
)
from server.schemas.worker import SyncColumnsRequest, SyncComponentsRequest
from server.utils.connect import get_db
from server.utils.state_context import get_state_context_payload

router = APIRouter(prefix="/worker", tags=["worker"])


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


@router.get("/app/{app_id}")
def get_app(app_id: UUID, db: Session = Depends(get_db)):
    return crud.app.get_object_by_id_or_404(db, id=app_id)


@router.put("/app/{app_id}")
def update_app(app_id: UUID, request: FinalizeApp, db: Session = Depends(get_db)):
    return finalize_app(db, app_id, request)


@router.delete("/app/{app_id}")
def delete_app(app_id: UUID, db: Session = Depends(get_db)):
    return crud.app.remove(db, id=app_id)


# @router.post("/file/")
# def create_file(request: CreateFiles, db: Session = Depends(get_db)):
#     return crud.files.create(db, obj_in=request)


# @router.put("/file/{file_id}")
# def update_file(file_id: UUID, request: UpdateFiles, db: Session = Depends(get_db)):
#     return crud.files.update_by_pk(db, pk=file_id, obj_in=request)


@router.post("/table/")
def create_table(request: CreateTables, response: Response, db: Session = Depends(get_db)):
    # create table
    crud.tables.create(db, obj_in=CreateTables(**request.dict()))
    db.commit()
    return get_state_context_payload(db, request.page_id)


@router.put("/table/")
def update_table(request: UpdateTablesRequest, response: Response, db: Session = Depends(get_db)):
    # update table
    table_updates = UpdateTables(**request.dict())
    table = crud.tables.update_by_pk(db, pk=request.table_id, obj_in=table_updates)
    file = crud.files.get_object_by_id_or_404(db, id=request.file_id)
    # update columns
    if request.table_columns is not None and len(request.table_columns) > 0:
        update_table_columns(db, table, request.table_columns, file.type)

    db.commit()
    return get_state_context_payload(db, request.page_id)


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
