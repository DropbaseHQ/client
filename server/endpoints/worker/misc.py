from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers.tables.convert import call_gpt, fill_smart_cols_data
from server.schemas.tables import ConvertTable, ReadTables, UpdateSmartTables
from server.utils.connect import get_db

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
    col_status = {}
    for col in columns:
        if col.name in req.smart_columns:
            col.property = req.smart_columns[col.name].dict()
            col_status[col.name] = "updated"
        else:
            col_status[col.name] = "skipped"
    db.commit()
    return col_status
