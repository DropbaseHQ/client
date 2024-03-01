from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from server.controllers.tables.convert import call_gpt, fill_smart_cols_data
from server.utils.authorization import get_current_user
from server.utils.authentication import verify_worker_token
from server.schemas import CheckPermissionRequest
from server.controllers.user import user_controller
from server.utils.connect import get_db
from server.models import User, Workspace

router = APIRouter()


class ConvertTable(BaseModel):
    user_sql: str
    column_names: list
    gpt_schema: dict
    db_schema: dict
    db_type: str


@router.post("/get_smart_cols/")
def get_smart_cols(req: ConvertTable, db: Session = Depends(get_db)):
    smart_col_paths = call_gpt(req.user_sql, req.column_names, req.gpt_schema, req.db_type)

    # Fill smart col data before validation to get
    # primary keys along with other column metadata
    return fill_smart_cols_data(smart_col_paths, req.db_schema)


@router.post(
    "/verify_token",
    dependencies=[Depends(get_current_user)],
)
def verify_token(user: User = Depends(get_current_user)):
    return {"user_id": user.id}


@router.post("/check_permission")
def check_permission(
    request: CheckPermissionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace: Workspace = Depends(verify_worker_token),
):
    return user_controller.check_permissions(db, user, request, workspace)


@router.get("/worker_workspace")
def get_worker_workspace(workspace: Workspace = Depends(verify_worker_token)):
    return {
        "id": workspace.id,
        "name": workspace.name,
    }
