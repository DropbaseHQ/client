from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.models import User
from server.schemas import CreateApp, ReadApp, ReadPage
from server.utils.permissions.casbin_utils import get_contexted_enforcer


def get_user_apps(db: Session, user: User, workspace_id: UUID):
    workspace = None
    if workspace_id is None:
        workspace = crud.user.get_user_first_workspace(db, user.id)
        if workspace is None:
            return []
    else:
        workspace = crud.workspace.get_object_by_id_or_404(db, id=workspace_id)
    apps = crud.app.get_workspace_apps(db, workspace_id=workspace.id)
    enforcer = get_contexted_enforcer(db, workspace.id)
    allowed_apps = []
    for app in apps:
        if enforcer.enforce(str(user.id), str(app.id), "use") or enforcer.enforce(
            str(user.id), "app", "use"
        ):
            app.pages = crud.page.get_app_pages(db, app.id)
            allowed_apps.append(app)

    return allowed_apps


def create_app(db: Session, request: CreateApp, user: User):
    first_workspace = crud.user.get_user_first_workspace(db, user.id)
    if request.workspace_id is None:
        request.workspace_id = first_workspace.id
    else:
        workspace = crud.workspace.get_object_by_id_or_404(db, id=request.workspace_id)
        if workspace not in crud.workspace.get_user_workspaces(db, user_id=user.id):
            raise Exception("User does not have access to the workspace")
    app = crud.app.create(db, obj_in=request)
    page = crud.page.create(db, obj_in={"name": "Page 1", "app_id": app.id})
    source = crud.source.get_workspace_sources(db, workspace_id=request.workspace_id)
    source_id = None
    if source:
        source_id = source[0].id
    table_name = "table1"
    table_property = {"name": table_name, "code": "", "type": "postgres"}
    table = crud.tables.create(
        db,
        obj_in={
            "name": table_name,
            "page_id": page.id,
            "property": table_property,
            "source_id": source_id,
            "type": "postgres",
        },
    )
    return {"app": ReadApp.from_orm(app), "page": ReadPage.from_orm(page), "table": table}


def get_app_pages(db: Session, user: User, app_id: UUID):
    return crud.page.get_app_pages(db, app_id)
