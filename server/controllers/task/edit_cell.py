# Final
from typing import List

from sqlalchemy import text

from server import crud
from server.controllers.task.source_column_helper import connect_to_user_db
from server.schemas.task import CellEdit, EditCell


def regroup_edits(edits: List[CellEdit]):
    # group by table name
    regrouped = {}
    for edit in edits:
        if edit.schema_name not in regrouped.keys():
            regrouped[edit.schema_name] = {}
        if edit.table_name not in regrouped[edit.schema_name].keys():
            regrouped[edit.schema_name][edit.table_name] = {"from": {}, "to": {}}
        regrouped[edit.schema_name][edit.table_name]["from"][edit.column_name] = edit.value
        regrouped[edit.schema_name][edit.table_name]["to"][edit.column_name] = edit.new_value
    return regrouped


def update_values(user_db_engine, schema, table, from_values, to_values):
    sql = f"""UPDATE "{schema}"."{table}"
SET {", ".join([f'{k} = :{k}_new' for k in to_values.keys()])}
WHERE {", ".join([f'{k} = :{k}_old' for k in from_values.keys()])};"""
    new_from_values = {k + "_old": v for k, v in from_values.items()}
    new_to_values = {k + "_new": v for k, v in to_values.items()}
    updates = {**new_from_values, **new_to_values}
    with user_db_engine.connect() as conn:
        conn.execute(
            text(sql),
            dict(updates),
        )


# TODO: get table meta when saving sql
table_meta = {
    "public": {
        "customer": {
            "key": "customer_id",
            "columns": [
                "customer_id",
                "name",
                "email",
                "age",
                "activebool",
                "create_date",
                "last_update",
                "active",
            ],
        },
        "plan": {
            "key": None,
            "columns": ["customer_id", "price"],
        },
    }
}


def edit_cell(db, request: EditCell):
    user_db_engine = connect_to_user_db()

    # TODO: get table meta when saving sql
    sql = crud.sqls.get_object_by_id_or_404(db, request.sql_id)
    table_meta = sql.table_meta

    regrouped = regroup_edits(request.edits)
    # print(regrouped)
    for schema, tables in regrouped.items():
        for table, columns in tables.items():
            key = table_meta[schema][table]["key"]
            table_key = {key: request.row[schema][table][key]}
            from_values = columns["from"]
            from_values = {**from_values, **table_key}
            to_values = columns["to"]
            update_values(user_db_engine, schema, table, from_values, to_values)
