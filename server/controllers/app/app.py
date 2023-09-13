from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.models import User
from server.schemas import CreateApp


def get_user_apps(db: Session, user: User):
    first_workspace = crud.user.get_user_first_workspace(db, user.id)
    if first_workspace is None:
        return []
    apps = crud.app.get_workspace_apps(db, workspace_id=first_workspace.id)
    for app in apps:
        app.pages = crud.page.get_app_pages(db, app.id)
    return apps


def create_app(db: Session, request: CreateApp, user: User):
    first_workspace = crud.user.get_user_first_workspace(db, user.id)
    if first_workspace is None:
        raise Exception("User has no workspace")
    if request.workspace_id is None:
        request.workspace_id = first_workspace.id
    app = crud.app.create(db, obj_in=request)
    page = crud.page.create(db, obj_in={"name": "Page 1", "app_id": app.id})
    table_name = "table1"
    table_property = {"name": table_name, "code": "", "type": "postgres"}
    crud.tables.create(db, obj_in={"name": table_name, "page_id": page.id, "property": table_property})
    return app


def get_app_pages(db: Session, user: User, app_id: UUID):
    first_workspace = crud.user.get_user_first_workspace(db, user.id)
    if first_workspace is None:
        return []
    return crud.page.get_app_pages(db, app_id)
