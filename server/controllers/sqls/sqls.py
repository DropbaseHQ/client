from server import crud
from server.controllers.sqls.test_sql import *
from server.controllers.task.table import compose_classes_from_row_data, get_table_schema
from server.schemas.sqls import CreateSQLs, UpdateSQLs


def create_sql(db, request: CreateSQLs):
    user_db_engine = connect_to_user_db()
    # test_sql(db, user_db_engine, request.code)
    schema, _ = get_table_schema(user_db_engine, request.code)
    row_dataclass = compose_classes_from_row_data(schema)
    request.dataclass = row_dataclass
    return crud.sqls.create(db, obj_in=request)


def update_sql(db: Session, sql_id: str, request: UpdateSQLs):
    user_db_engine = connect_to_user_db()
    if request.code:
        # test_sql(db, user_db_engine, request.code)
        sql = crud.sqls.get_object_by_id_or_404(db, id=sql_id)
        schema, _ = get_table_schema(user_db_engine, request.code)
        row_dataclass = compose_classes_from_row_data(schema)
        request.dataclass = row_dataclass
    return crud.sqls.update(db, db_obj=sql, obj_in=request)
