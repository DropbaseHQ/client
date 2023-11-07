from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.models import User
from server.schemas import CreateApp, FinalizeApp, ReadApp, ReadPage
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
    app_requests = []

    for app in apps:
        app_requests.append([str(user.id), str(app.id), "use"])
        app_requests.append([str(user.id), "app", "use"])
        app_requests.append([str(user.id), str(app.id), "edit"])
        app_requests.append([str(user.id), "app", "edit"])

    result = enforcer.batch_enforce(app_requests)
    for permission_chunk, app in zip(zip(*[iter(result)] * 4), apps):
        user_can_use_specific_app = permission_chunk[0]
        user_can_use_app = permission_chunk[1]
        user_can_edit_specific_app = permission_chunk[2]
        user_can_edit_app = permission_chunk[3]
        if user_can_use_specific_app or user_can_use_app:
            app.pages = crud.page.get_app_pages(db, app.id)
            if user_can_edit_specific_app or user_can_edit_app:
                app.editable = True
            allowed_apps.append(app)

    return allowed_apps


def create_app(db: Session, request: CreateApp, user: User):
    if request.workspace_id is None:
        raise Exception("Workspace ID is required")
    workspace = crud.workspace.get_object_by_id_or_404(db, id=request.workspace_id)
    if workspace not in crud.workspace.get_user_workspaces(db, user_id=user.id):
        raise Exception("User does not have access to the workspace")
    app = crud.app.create(db, obj_in=request)
    page = crud.page.create(db, obj_in={"name": "Page 1", "app_id": app.id})

    table_name = "table1"
    table_property = {"name": table_name, "code": "", "type": "postgres"}
    table = crud.tables.create(
        db,
        obj_in={
            "name": table_name,
            "page_id": page.id,
            "property": table_property,
            "type": "postgres",
        },
    )
    return {"app": ReadApp.from_orm(app), "page": ReadPage.from_orm(page), "table": table}


def get_app_pages(db: Session, user: User, app_id: UUID):
    return crud.page.get_app_pages(db, app_id)


def get_app_template():
    return {
        "page": {"name": "page1"},
        "table": {
            "name": "table1",
            "property": {"name": "table1", "code": "", "type": "postgres"},
            "type": "postgres",
            "page": "page1",
        },
    }


def create_draft_app(db: Session, request: CreateApp, user: User):
    try:
        if request.workspace_id is None:
            raise Exception("Workspace ID is required")
        workspace = crud.workspace.get_object_by_id_or_404(db, id=request.workspace_id)
        if workspace not in crud.workspace.get_user_workspaces(db, user_id=user.id):
            raise Exception("User does not have access to the workspace")

        default_app_template = get_app_template()

        # Create a draft app
        new_draft_app = crud.app.create(
            db,
            obj_in={"name": request.name, "workspace_id": request.workspace_id, "is_draft": True},
            auto_commit=False,
        )
        db.flush()

        # Create a default page
        default_app_page = default_app_template.get("page")
        new_draft_page = crud.page.create(
            db,
            obj_in={"name": default_app_page.get("name"), "app_id": new_draft_app.id},
            auto_commit=False,
        )
        db.flush()
        default_app_page["id"] = new_draft_page.id

        # Create a default table
        default_app_table = default_app_template.get("table")
        crud.tables.create(
            db,
            obj_in={
                "name": default_app_table.get("name"),
                "page_id": new_draft_page.id,
                "property": default_app_table.get("property"),
            },
            auto_commit=False,
        )
        default_app_table["page_id"] = new_draft_page.id
        db.commit()
    except Exception as e:
        print("Error creating draft app", e)
        db.rollback()
        return {"message": "Error creating draft app"}
    return {"message": "Success", "app_id": new_draft_app.id, "app_template": default_app_template}


def finalize_app(db: Session, app_id: UUID, request: FinalizeApp):
    crud.app.get_object_by_id_or_404(db, id=app_id)

    try:
        crud.app.update_by_pk(db=db, pk=app_id, obj_in={"is_draft": request.is_draft}, auto_commit=False)
        db.commit()
    except Exception as e:
        print("Error finalizing app", e)
        db.rollback()
        return {"message": "Error finalizing app"}


def delete_app(db: Session, app_id: UUID):
    crud.app.remove(db, id=app_id)
    return {"message": "Success"}
