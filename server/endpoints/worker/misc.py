from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from server.controllers.tables.convert import call_gpt, fill_smart_cols_data
from server.utils.authorization import get_current_user
from server.utils.authentication import verify_worker_token
from server.schemas import CheckPermissionRequest, SyncStructureRequest, SyncAppRequest
from server.controllers.user import user_controller
from server.utils.connect import get_db
from server.models import User, Workspace
from server import crud

router = APIRouter()


class ConvertTable(BaseModel):
    user_sql: str
    column_names: list
    gpt_schema: dict
    db_schema: dict
    db_type: str


@router.post("/get_smart_cols/")
def get_smart_cols(req: ConvertTable, db: Session = Depends(get_db)):
    smart_col_paths = call_gpt(
        req.user_sql, req.column_names, req.gpt_schema, req.db_type
    )

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


@router.post("/sync/structure")
def sync_structure(
    request: SyncStructureRequest,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(verify_worker_token),
):
    structure_report = {"apps_with_id": {}, "apps_without_id": []}

    for app in request.apps:
        target_app = crud.app.get(db, id=app.id)
        if not target_app:
            app_by_name = crud.app.get_app_by_name(
                db=db, app_name=app.name, workspace_id=workspace.id
            )
            if not app_by_name:
                structure_report["apps_without_id"].append(
                    {
                        "status": "NOT_FOUND",
                        "message": f"App with id {app.id} not found. No app with name {app.name} found either.",
                    }
                )
            else:
                structure_report["apps_without_id"].append(
                    {
                        "status": "ID_NOT_FOUND_NAME_FOUND",
                        "message": f"App with id {app.id} not found. App with name {app.name} found. Suggest resyncing.",
                        "name": app.name,
                    }
                )
            continue

        if target_app.name != app.name:
            crud.app.update_by_pk(db, pk=target_app.id, obj_in={"name": app.name})
            structure_report["apps_with_id"][app.id] = {
                "status": "UPDATED",
                "message": f"App with id {app.id} updated in database",
            }

        if target_app.label != app.label:
            crud.app.update_by_pk(db, pk=target_app.id, obj_in={"label": app.label})
            structure_report["apps_with_id"][app.id] = {
                "status": "UPDATED",
                "message": f"App with id {app.id} updated in database",
            }

        if target_app.label == app.label and target_app.name == app.name:
            structure_report["apps_with_id"][app.id] = {
                "status": "SYNCED",
                "message": f"App with id {app.id} is already synced. No changes made.",
            }

        if not app.pages:
            continue
        for page in app.pages:
            target_page = crud.page.get(db, id=page.id)
            if not target_page:
                page_by_name = crud.page.get_page_by_name(
                    db=db, name=page.name, app_id=app.id
                )
                if not page_by_name:
                    structure_report["apps_with_id"][app.id][page.id] = {
                        "status": "NOT_FOUND",
                        "message": f"Page with id {page.id} not found. No page with name {page.name} found either.",
                    }
                else:
                    structure_report["apps_with_id"][app.id][page.id] = {
                        "status": "ID_NOT_FOUND_NAME_FOUND",
                        "message": f"Page with id {page.id} not found. Page with name {page.name} found. Suggest resyncing.",
                    }
                continue

            if target_page.name != page.name:
                crud.page.update_by_pk(
                    db, pk=target_page.id, obj_in={"name": page.name}
                )
                structure_report["apps_with_id"][app.id][page.id] = {
                    "status": "UPDATED",
                    "message": f"Page with id {page.id} updated in database",
                }

            if target_page.label != page.label:
                crud.page.update_by_pk(
                    db, pk=target_page.id, obj_in={"label": page.label}
                )
                structure_report["apps_with_id"][app.id][page.id] = {
                    "status": "UPDATED",
                    "message": f"Page with id {page.id} updated in database",
                }

            if target_page.label == page.label and target_page.name == page.name:
                structure_report["apps_with_id"][app.id][page.id] = {
                    "status": "SYNCED",
                    "message": f"Page with id {page.id} is already synced. No changes made.",
                }
    return structure_report


@router.post("/sync/app")
def sync_app(
    request: SyncAppRequest,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(verify_worker_token),
):
    if not request.generate_new and request.app_name is not None:
        app = crud.app.get_app_by_name(db, request.app_name, workspace.id)
        if not app:
            return HTTPException(
                status_code=404,
                detail=f"App with name {request.app_name} not found in workspace",
            )
        return {"status": "FOUND", "app_id": app.id}
    if request.app_name is None:
        return HTTPException(status_code=400, detail="App name not provided")

    new_app = crud.app.create(
        db=db,
        obj_in={
            "name": request.app_name,
            "label": request.app_label,
            "workspace_id": workspace.id,
        },
    )

    return {"status": "CREATED", "app_id": new_app.id}
