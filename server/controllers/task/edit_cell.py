# Final
from typing import List

from sqlalchemy import text

from server import crud
from server.controllers.task.source_column_helper import connect_to_user_db
from server.schemas.task import CellEdit, EditCell


def edit_cell(db, request: EditCell):
    user_db_engine = connect_to_user_db()

    # TODO: get table meta when saving sql
    sql = crud.sqls.get_object_by_id_or_404(db, request.sql_id)
    table_meta = sql.table_meta


def update_value(user_db_engine, edit: CellEdit):
    sql = f"""UPDATE "{edit.schema_name}"."{edit.table_name}"
SET {edit.column_name} = :{edit.column_name}
WHERE {edit.key_column_name} = :{edit.key_column_name} and {edit.column_name} = :{edit.column_name}_old
"""
    values = {
        edit.column_name: edit.new_value,
        edit.column_name + "_old": edit.value,
        edit.key_column_name: edit.key_column_value,
    }
    with user_db_engine.connect() as conn:
        conn.execute(
            text(sql),
            values,
        )
        conn.commit()
