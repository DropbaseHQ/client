# Final
from sqlalchemy import text
from sqlalchemy.orm import Session

from server import crud
from server.schemas.columns import PgColumnBaseProperty
from server.schemas.task import CellEdit, EditCell
from server.utils.connect_to_user_db import connect_to_user_db


def edit_cell(db: Session, request: EditCell):
    table = crud.tables.get_object_by_id_or_404(db, id=request.table_id)
    user_db_engine = connect_to_user_db(db, table.source_id)
    for edit in request.edits:
        update_value(db, user_db_engine, edit)
    user_db_engine.dispose()


def update_value(db, user_db_engine, edit: CellEdit):
    columns_name = edit.column_name
    column = edit.columns[columns_name]

    values = {
        "new_value": edit.new_value,
        "old_value": edit.old_value,
    }
    prim_key_list = []
    edit_keys = column.edit_keys
    for key in edit_keys:
        pk_col = edit.columns[key]
        prim_key_list.append(f"{pk_col.column_name} = :{pk_col.column_name}")
        values[pk_col.column_name] = edit.row[pk_col.name]
    prim_key_str = " AND ".join(prim_key_list)

    sql = f"""UPDATE "{column.schema_name}"."{column.table_name}"
SET {column.column_name} = :new_value
WHERE {prim_key_str} AND {column.column_name} = :old_value
"""
    with user_db_engine.connect() as conn:
        conn.execute(text(sql), values)
        conn.commit()
