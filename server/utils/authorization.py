import asyncio
from typing import Optional, Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session

from server import crud
from server.models import User
from server.utils.authentication import get_current_user
from server.utils.connect import get_db


class RESOURCES:
    WIDGET = "widget"
    APP = "app"
    COLUMNS = "columns"
    COMPONENTS = "components"
    FUNCTIONS = "functions"
    PAGE = "page"
    ROLE = "role"
    SOURCE = "source"
    USER = "user"
    WORKSPACE = "workspace"
    TABLE = "table"  # FIXME: columns endpoints take "table_id" instead of "tables_id"
    TABLES = "tables"
    TASK = "task"


class ACTIONS:
    USE: str = "use"
    EDIT: str = "edit"
    OWN: str = "own"


resource_query_mapper = {
    RESOURCES.WIDGET: crud.widget,
    RESOURCES.APP: crud.app,
    RESOURCES.COLUMNS: crud.columns,
    RESOURCES.COMPONENTS: crud.components,
    RESOURCES.FUNCTIONS: crud.functions,
    RESOURCES.PAGE: crud.page,
    RESOURCES.ROLE: crud.user_role,
    RESOURCES.SOURCE: crud.source,
    RESOURCES.USER: crud.user,
    RESOURCES.WORKSPACE: crud.workspace,
    RESOURCES.TABLE: crud.tables,
    RESOURCES.TABLES: crud.tables,
}


def get_resource_workspace_id(db: Session, resource_id: str, resource_type: str):
    if resource_type in resource_query_mapper:
        crud_handler = resource_query_mapper[resource_type]
        if hasattr(crud_handler, "get_workspace_id"):
            return crud_handler.get_workspace_id(db, resource_id)
        resource = crud_handler.get(db, resource_id)
        if hasattr(resource, "workspace_id"):
            return resource.workspace_id
    return None


def verify_user_id_belongs_to_current_user(
    user_id: str,
    user: User = Depends(get_current_user),
):
    if not user_id == user.id:
        HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User {user.id} cannot access user {user_id}",
        )


def generate_resource_dependency(resource_type: str, is_on_resource_creation: bool = False):
    resource_id_accessor = f"{resource_type}_id"

    def get_resource_id_from_path_params(request: Request) -> Optional[str]:
        return request.path_params.get(resource_id_accessor, None)

    def get_resource_id_from_req_body(request: Request) -> Optional[str]:
        body = asyncio.run(request.json())
        return body.get(resource_id_accessor)

    if is_on_resource_creation:
        get_resource_id = get_resource_id_from_req_body
    else:
        get_resource_id = get_resource_id_from_path_params

    def verify_user_can_act_on_resource(
        request: Request,
        db: Session = Depends(get_db),
        user: User = Depends(get_current_user),
    ):
        resource_id = get_resource_id(request)
        if resource_id is None:
            return True

        resource_workspace_id = get_resource_workspace_id(db, resource_id, resource_type)
        if resource_workspace_id is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Resource {resource_id} of type {resource_type} not found",
            )

        can_act_on_resource = crud.user_role.user_is_in_workspace(db, user.id, resource_workspace_id)
        if not can_act_on_resource:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User {user.id} cannot act on resource {resource_id}",
            )
        return True

    return verify_user_can_act_on_resource
