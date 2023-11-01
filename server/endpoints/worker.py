# for calls from worker
# TODO: hide behind protected route
from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from server import crud
from server.controllers.app import finalize_app
from server.controllers.columns import update_table_columns
from server.controllers.state.state import get_state_context
from server.schemas import FinalizeApp
from server.schemas.files import CreateFiles, UpdateFiles
from server.schemas.tables import CreateTables, UpdateTables, UpdateTablesRequest
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
        update_table_columns(db, table, columns, request.table_type)

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


@router.get("/app/{app_id}")
def get_app(app_id: UUID, db: Session = Depends(get_db)):
    return crud.app.get_object_by_id_or_404(db, id=app_id)


@router.put("/app/{app_id}")
def update_app(app_id: UUID, request: FinalizeApp, db: Session = Depends(get_db)):
    return finalize_app(db, app_id, request)


@router.post("/file/")
def create_file(request: CreateFiles, db: Session = Depends(get_db)):
    return crud.files.create(db, obj_in=request)


@router.put("/file/{file_id}")
def update_file(file_id: UUID, request: UpdateFiles, db: Session = Depends(get_db)):
    return crud.files.update_by_pk(db, pk=file_id, obj_in=request)


@router.post("/table/")
def create_table(request: CreateTables, response: Response, db: Session = Depends(get_db)):
    # create table
    crud.tables.create(db, obj_in=CreateTables(**request.dict()))
    page = crud.page.get_object_by_id_or_404(db, id=request.page_id)
    app = crud.app.get_app_by_page_id(db, page_id=request.page_id)
    # get new State and Context
    db.commit()
    State, Context = get_state_context(db, request.page_id)
    return {
        "app_name": app.name,
        "page_name": page.name,
        "state": State.schema(),
        "context": Context.schema(),
        "status": "success",
    }


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
    # get page and app
    page = crud.page.get_object_by_id_or_404(db, id=request.page_id)
    app = crud.app.get_app_by_page_id(db, page_id=request.page_id)
    # get new State and Context
    State, Context = get_state_context(db, request.page_id)
    return {
        "app_name": app.name,
        "page_name": page.name,
        "state": State.schema(),
        "context": Context.schema(),
        "status": "success",
    }
