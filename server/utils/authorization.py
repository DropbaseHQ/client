from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from server import crud
from server.models import User
from server.utils.authentication import get_current_user
from server.utils.connect import get_db


class RESOURCES:
    WIDGET = "widget"
    APP = "app"
    COMPONENTS = "components"
    FUNCTIONS = "functions"
    PAGE = "page"
    ROLE = "role"
    SOURCE = "source"
    USER = "user"
    WORKSPACE = "workspace"
    SQLS = "sqls"


resource_query_mapper = {
    RESOURCES.WIDGET: crud.widget,
    RESOURCES.APP: crud.app,
    RESOURCES.COMPONENTS: crud.components,
    RESOURCES.FUNCTIONS: crud.functions,
    RESOURCES.PAGE: crud.page,
    RESOURCES.ROLE: crud.role,
    RESOURCES.SOURCE: crud.source,
    RESOURCES.USER: crud.user,
    RESOURCES.WORKSPACE: crud.workspace,
    RESOURCES.SQLS: crud.sqls,
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


def generate_resource_dependency(resource_type: str):
    def verify_user_can_act_on_resource(
        request: Request,
        db: Session = Depends(get_db),
        user: User = Depends(get_current_user),
    ):
        resource_id_accessor = f"{resource_type}_id"
        resource_id = request.path_params.get(resource_id_accessor, None)
        if resource_id is None:
            return True

        resource_workspace_id = get_resource_workspace_id(db, resource_id, resource_type)
        if resource_workspace_id is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Resource {resource_id} of type {resource_type} not found",
            )

        can_act_on_resource = crud.role.user_is_in_workspace(db, user.id, resource_workspace_id)
        if not can_act_on_resource:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User {user.id} cannot act on resource {resource_id}",
            )
        return True

    return verify_user_can_act_on_resource
