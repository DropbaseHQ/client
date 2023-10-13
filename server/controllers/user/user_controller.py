from fastapi import HTTPException, Response, status
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from server import crud
from server.models import Policy
from server.schemas import PolicyTemplate
from server.constants import ACCESS_TOKEN_EXPIRE_SECONDS, REFRESH_TOKEN_EXPIRE_SECONDS
from server.schemas.user_role import CreateUserRole
from server.utils.permissions.casbin_utils import get_contexted_enforcer

from server.schemas.user import (
    CreateUser,
    CreateUserRequest,
    LoginUser,
    ReadUser,
    ResetPasswordRequest,
    AddPolicyRequest,
    UpdateUserPolicyRequest,
)
from server.schemas.workspace import CreateWorkspace, ReadWorkspace
from server.utils.authentication import authenticate_user, get_password_hash
from server.utils.helper import raise_http_exception


def get_user(db: Session, user_email: str):
    try:
        return crud.user.get_user_by_email(db, email=user_email)
    except Exception as e:
        print("error", e)
        raise_http_exception(status_code=404, message="User not found")


def login_user(db: Session, Authorize: AuthJWT, request: LoginUser):
    try:
        user = authenticate_user(db, request.email, request.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token = Authorize.create_access_token(
            subject=user.email, expires_time=ACCESS_TOKEN_EXPIRE_SECONDS
        )
        refresh_token = Authorize.create_refresh_token(
            subject=user.email, expires_time=REFRESH_TOKEN_EXPIRE_SECONDS
        )

        Authorize.set_access_cookies(access_token)
        Authorize.set_refresh_cookies(refresh_token)

        workspaces = crud.workspace.get_user_workspaces(db, user_id=user.id)

        return {"user": ReadUser.from_orm(user), "workspace": ReadWorkspace.from_orm(workspaces[0])}
    except HTTPException as e:
        raise_http_exception(status_code=e.status_code, message=e.detail)
    except Exception as e:
        print("error", e)
        raise_http_exception(status_code=500, message="Internal server error")


def logout_user(response: Response, Authorize: AuthJWT):
    try:
        Authorize.jwt_required()
        # Authorize.unset_jwt_cookies()
        response.delete_cookie("access_token_cookie", samesite="none", secure=True)
        response.delete_cookie("refresh_token_cookie", samesite="none", secure=True)
        return {"msg": "Successfully logout"}
    except Exception as e:
        print("error", e)
        raise_http_exception(status_code=500, message="Internal server error")


def refresh_token(Authorize: AuthJWT):
    try:
        Authorize.jwt_refresh_token_required()
        current_user = Authorize.get_jwt_subject()
        new_access_token = Authorize.create_access_token(subject=current_user)
        Authorize.set_access_cookies(new_access_token)
        return {"msg": "Successfully refresh token"}
    except Exception as e:
        print("error", e)
        raise_http_exception(status_code=500, message="Internal server error")


def register_user(db: Session, request: CreateUserRequest):
    try:
        hashed_password = get_password_hash(request.password)
        user_obj = CreateUser(
            name=request.name,
            email=request.email,
            hashed_password=hashed_password,
            trial_eligible=True,
            active=True,
        )
        user = crud.user.create(db, obj_in=user_obj)

        workspace_obj = CreateWorkspace(
            name="workspace",
            active=True,
        )
        workspace = crud.workspace.create(db, obj_in=workspace_obj, auto_commit=False)
        # TODO: get admin role id from db
        db.flush()
        admin_role_id = "00000000-0000-0000-0000-000000000001"
        role_obj = CreateUserRole(
            user_id=user.id,
            workspace_id=workspace.id,
            role_id=admin_role_id,
        )
        crud.user_role.create(db, obj_in=role_obj, auto_commit=False)
        db.flush()
        admin_role = crud.role.get(db, id=admin_role_id)
        crud.policy.create(
            db,
            obj_in=Policy(
                ptype="g",
                v0=str(user.id),
                v1=admin_role.name,
                workspace_id=workspace.id,
            ),
            auto_commit=False,
        )
        db.commit()
        return {"message": "User successfully registered"}
    except Exception as e:
        db.rollback()
        print("error", e)
        raise_http_exception(status_code=500, message="Internal server error")


# TODO: VERIFY RESET TOKEN
def reset_password(db: Session, request: ResetPasswordRequest):
    try:
        user = crud.user.get_user_by_email(db, email=request.email)
        if not user:
            raise_http_exception(status_code=404, message="User not found")
        hashed_password = get_password_hash(request.new_password)
        crud.user.update(db, db_obj=user, obj_in={"hashed_password": hashed_password})
        return {"message": "Password successfully reset"}
    except Exception as e:
        print("error", e)
        raise_http_exception(status_code=500, message="Internal server error")


def add_policy(db: Session, user_id: UUID, request: AddPolicyRequest):
    try:
        for policy in request.policies:
            crud.policy.create(
                db,
                obj_in=Policy(
                    ptype="p",
                    v0=10,
                    v1=user_id,
                    v2=policy.resource,
                    v3=policy.action,
                    workspace_id=request.workspace_id,
                ),
                auto_commit=False,
            )
            db.commit()
            return {"message": "Polices successfully added"}

    except Exception as e:
        print("error", e)
        db.rollback()
        raise_http_exception(status_code=500, message="Internal server error")


def remove_policy(db: Session, user_id: UUID, request: AddPolicyRequest):
    try:
        for policy in request.policies:
            db.query(Policy).filter(
                Policy.v1 == str(user_id),
                Policy.v2 == policy.resource,
                Policy.v3 == policy.action,
                Policy.workspace_id == request.workspace_id,
            ).delete()
            db.commit()
            return {"message": "Polices successfully removed"}

    except Exception as e:
        print("error", e)
        db.rollback()
        raise_http_exception(status_code=500, message="Internal server error")


def get_user_permissions(db: Session, user_id: UUID, workspace_id: UUID):
    user = crud.user.get_object_by_id_or_404(db, id=user_id)
    user_role = crud.user_role.get_user_role(db, user_id=user_id, workspace_id=workspace_id)
    enforcer = get_contexted_enforcer(db, workspace_id)
    permissions = enforcer.get_filtered_policy(1, str(user.id))
    formatted_permissions = []
    for permission in permissions:
        formatted_permissions.append(
            {
                "user_id": permission[1],
                "resource": permission[2],
                "action": permission[3],
            }
        )
    return {"user": user, "workspace_role": user_role, "permissions": formatted_permissions}


def update_policy(db: Session, user_id: UUID, request: UpdateUserPolicyRequest):
    user = crud.user.get_object_by_id_or_404(db, id=user_id)
    try:
        exisiting_policy = (
            db.query(Policy)
            .filter(
                Policy.v1 == str(user.id),
                Policy.v2 == request.resource,
                Policy.v3 == request.action,
            )
            .filter(Policy.workspace_id == request.workspace_id)
            .one_or_none()
        )

        if exisiting_policy and request.effect == "deny":
            db.query(Policy).filter(
                Policy.v1 == str(user.id),
                Policy.v2 == request.resource,
                Policy.v3 == request.action,
            ).filter(Policy.workspace_id == request.workspace_id).delete()

        elif not exisiting_policy and request.effect == "allow":
            crud.policy.create(
                db,
                obj_in=Policy(
                    ptype="p",
                    v0=10,
                    v1=user.id,
                    v2=request.resource,
                    v3=request.action,
                    workspace_id=request.workspace_id,
                ),
                auto_commit=False,
            )
        db.commit()
        return {"message": "success"}
    except Exception as e:
        db.rollback()
        raise e


def get_user_workspaces(db: Session, user_id: UUID):
    workspaces = crud.workspace.get_user_workspaces(db, user_id=user_id)
    formatted_workspaces = []
    for workspace in workspaces:
        workspace_oldest_user = crud.workspace.get_oldest_user(db, workspace_id=workspace.id)
        formatted_workspaces.append(
            {
                "id": workspace.id,
                "name": workspace.name,
                "oldest_user": workspace_oldest_user,
            }
        )

    return formatted_workspaces