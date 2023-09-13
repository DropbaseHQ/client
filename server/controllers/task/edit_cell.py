# Final
from sqlalchemy import text
from sqlalchemy.orm import Session

from server import crud
from server.controllers.task.source_column_helper import connect_to_user_db
from server.schemas.columns import PgColumnBaseProperty
from server.schemas.task import CellEdit, EditCell


def edit_cell(db: Session, request: EditCell):
    user_db_engine = connect_to_user_db()
    for edit in request.edits:
        update_value(db, user_db_engine, edit)
    user_db_engine.dispose()


def update_value(db, user_db_engine, edit: CellEdit):
    column = crud.columns.get_object_by_id_or_404(db, id=edit.column_id)
    col_prop = PgColumnBaseProperty(**column.property)

    values = {
        "new_value": edit.new_value,
        "old_value": edit.value,
    }
    prim_key_list = []
    for key in col_prop.edit_keys:
        prim_key_list.append(f"{key} = :{key}")
        values[key] = edit.key_column_values[key]
    prim_key_str = " AND ".join(prim_key_list)

    sql = f"""UPDATE "{col_prop.schema_name}"."{col_prop.table_name}"
SET {col_prop.column_name} = :new_value
WHERE {prim_key_str} AND {col_prop.column_name} = :old_value
"""
    with user_db_engine.connect() as conn:
        conn.execute(text(sql), values)
        conn.commit()
