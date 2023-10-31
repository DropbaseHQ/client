from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.models import User
from server.schemas import FinalizeApp
from server.schemas import CreateApp, ReadApp, ReadPage, CreateApp
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


def create_draft_app(db: Session, request: CreateApp, user: User):
    try:
        if request.workspace_id is None:
            raise Exception("Workspace ID is required")
        workspace = crud.workspace.get_object_by_id_or_404(db, id=request.workspace_id)
        if workspace not in crud.workspace.get_user_workspaces(db, user_id=user.id):
            raise Exception("User does not have access to the workspace")

        new_draft_app = crud.app.create(
            db,
            obj_in={"name": request.name, "workspace_id": request.workspace_id, "is_draft": True},
            auto_commit=False,
        )
        db.flush()
        new_draft_page = crud.page.create(
            db, obj_in={"name": "page1", "app_id": new_draft_app.id}, auto_commit=False
        )
        db.flush()
        crud.tables.create(
            db,
            obj_in={
                "name": "table1",
                "page_id": new_draft_page.id,
                "property": {"name": "table1", "code": "", "type": "postgres"},
                "type": "postgres",
            },
            auto_commit=False,
        )
        db.commit()
    except Exception as e:
        print("Error creating draft app", e)
        db.rollback()
        return {"message": "Error creating draft app"}
    return {"message": "Success", "app_id": new_draft_app.id, "page_id": new_draft_page.id}


def finalize_app(db: Session, app_id: UUID, request: FinalizeApp):
    crud.app.get_object_by_id_or_404(db, id=app_id)
    default_page = crud.page.get_first_app_page(db, app_id)
    default_table = crud.tables.get_page_tables(db, default_page.id)[0]

    ext_type_mapper = {
        "py": "data_fetcher",
        "sql": "sql",
    }

    try:
        default_table_file = None
        for function in request.functions:
            if "__" in function.name:
                continue
            ext = function.name.split(".")[1]
            new_file = crud.files.create(
                db=db,
                obj_in={
                    "page_id": default_page.id,
                    "name": function.name,
                    "source": function.source,
                    "type": ext_type_mapper[ext],
                },
                auto_commit=False,
            )
            if ext_type_mapper[ext] == "sql":
                default_table_file = new_file

        db.flush()
        if default_table_file:
            crud.tables.update_by_pk(
                db=db,
                pk=default_table.id,
                obj_in={"file_id": default_table_file.id},
                auto_commit=False,
            )

        crud.app.update_by_pk(db=db, pk=app_id, obj_in={"is_draft": request.is_draft}, auto_commit=False)
        db.commit()
    except Exception as e:
        print("Error finalizing app", e)
        db.rollback()
        return {"message": "Error finalizing app"}
