from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers.tables.convert import call_gpt, fill_smart_cols_data
from server.schemas.tables import ConvertTable, ReadTables, UpdateSmartTables
from server.utils.authorization import get_current_user

from server.utils.connect import get_db
from server.utils.state_context import get_state_context_payload

router = APIRouter()


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
    for col in columns:
        if col.name in req.smart_columns:
            col.property = req.smart_columns[col.name]
    db.commit()
    page = crud.page.get_table_page(db, table_id=table.id)
    state_context = get_state_context_payload(db, page.id)
    return {"state_context": state_context, "table": table}


@router.post(
    "/verify_token",
    dependencies=[Depends(get_current_user)],
)
def verify_token():
    return {"success": True}
