import secrets
from datetime import datetime, timedelta
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse
from fastapi import HTTPException, Response, status
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from uuid import UUID

from server import crud
from server.models import Policy
from server.constants import (
    ACCESS_TOKEN_EXPIRE_SECONDS,
    REFRESH_TOKEN_EXPIRE_SECONDS,
    CLIENT_URL,
)
from server.schemas.user_role import CreateUserRole
from server.utils.permissions.casbin_utils import get_contexted_enforcer
from server.emails.emailer import send_email
from server.utils.hash import get_confirmation_token_hash
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
from server.utils.authentication import (
    authenticate_user,
    get_password_hash,
    verify_password,
)
from server.controllers.policy import (
    PolicyUpdater,
    format_permissions_for_highest_action,
)
from server.utils.helper import raise_http_exception
from server.utils.loops_integration import loops_controller
from server.utils.slack import slack_sign_up


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
        if not user.active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email needs to be verified.",
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
        return {
            "user": ReadUser.from_orm(user),
            "workspace": ReadWorkspace.from_orm(workspaces[0]),
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

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
        return {"msg": "Successfully refresh token", "access_token": new_access_token}
    except Exception as e:
        print("error", e)
        raise_http_exception(status_code=500, message="Internal server error")


def register_user(db: Session, request: CreateUserRequest):
    try:
        hashed_password = get_password_hash(request.password)
        confirmation_token = get_confirmation_token_hash(
            request.email + hashed_password + request.name
        )

        user_obj = CreateUser(
            name=request.name,
            email=request.email,
            hashed_password=hashed_password,
            trial_eligible=True,
            active=False,
            confirmation_token=confirmation_token,
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
        confirmation_link = (
            f"{CLIENT_URL}/email-confirmation/{confirmation_token}/{user.id}"
        )

        send_email(
            email_name="verifyEmail",
            email_params={
                "email": user.email,
                "url": confirmation_link,
            },
        )
        slack_sign_up(name=user.name, email=user.email)
        db.commit()
        return {"message": "User successfully registered"}
    except Exception as e:
        db.rollback()
        print("error", e)
        raise_http_exception(status_code=500, message="Internal server error")


def verify_user(db: Session, token: str, user_id: UUID):
    user = crud.user.get_object_by_id_or_404(db, id=user_id)
    if user.confirmation_token == token:
        try:
            user.confirmation_token = None
            user.active = True
            loops_controller.add_user(
                user_email=user.email, name=user.name, user_id=str(user.id)
            )
            db.commit()
            return {"message": "User successfully confirmed"}
        except Exception as e:
            db.rollback()
            print("error", e)
            raise_http_exception(status_code=500, message="Internal server error")
    raise_http_exception(status_code=404, message="User not found")


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
    user_role = crud.user_role.get_user_role(
        db, user_id=user_id, workspace_id=workspace_id
    )
    enforcer = get_contexted_enforcer(db, workspace_id)
    permissions = enforcer.get_filtered_policy(1, str(user.id))

    formatted_permissions = format_permissions_for_highest_action(permissions)

    formatted_user = user.__dict__
    formatted_user.pop("hashed_password")
    formatted_user.pop("active")
    formatted_user.pop("date")

    return {
        "user": formatted_user,
        "workspace_role": user_role,
        "permissions": formatted_permissions,
    }


def update_policy(db: Session, user_id: UUID, request: UpdateUserPolicyRequest):
    policy_updater = PolicyUpdater(
        db=db,
        subject_id=user_id,
        workspace_id=request.workspace_id,
        request=request,
    )
    return policy_updater.update_policy()


def get_user_workspaces(db: Session, user_id: UUID):
    workspaces = crud.workspace.get_user_workspaces(db, user_id=user_id)
    formatted_workspaces = []
    for workspace in workspaces:
        workspace_oldest_user = crud.workspace.get_oldest_user(
            db, workspace_id=workspace.id
        )
        formatted_workspaces.append(
            {
                "id": workspace.id,
                "name": workspace.name,
                "oldest_user": workspace_oldest_user,
                "worker_url": workspace.worker_url,
            }
        )

    return formatted_workspaces


def resend_confirmation_email(db: Session, user_email: str):
    user = crud.user.get_user_by_email(db, email=user_email)
    confirmation_link = (
        f"{CLIENT_URL}/email-confirmation/{user.confirmation_token}/{user.id}"
    )

    send_email(
        email_name="verifyEmail",
        email_params={"email": user.email, "url": confirmation_link},
    )


def _add_query_params(url, params):
    parsed_url = urlparse(url)
    query_params = parse_qs(parsed_url.query)
    query_params.update(params)
    encoded_params = urlencode(query_params, doseq=True)
    updated_url = urlunparse(parsed_url._replace(query=encoded_params))
    return updated_url


def request_reset_password(db: Session, request: ResetPasswordRequest):
    user = crud.user.get_user_by_email(db, email=request.email)
    if user:
        # Generate reset-token
        reset_token = secrets.token_urlsafe(16)
        hashed_token = get_password_hash(reset_token)
        expiry_hours = 2
        expiration_time = datetime.now() + timedelta(hours=expiry_hours)
        reset_link = f"{CLIENT_URL}/reset"
        link_with_q_params = _add_query_params(
            reset_link, {"email": user.email, "token": reset_token}
        )
        crud.reset_token.create(
            db,
            obj_in={
                "hashed_token": hashed_token,
                "user_id": user.id,
                "expiration_time": expiration_time,
                "status": "valid",
            },
        )
        send_email(
            "resetPassword",
            {
                "email": user.email,
                "reset_link": link_with_q_params,
                "expiration_time": f"in {expiry_hours} hours",
                "support_email": "support@dropbase.io",
            },
        )
        return {"message": "Successfully sent password reset email."}
    raise_http_exception(400, message="No user associated with this email.")


def reset_password(db: Session, request: ResetPasswordRequest):
    user = crud.user.get_user_by_email(db, email=request.email)
    if not user:
        raise_http_exception(400, "No user associated with this email.")

    user_reset_token = crud.reset_token.get_latest_user_refresh_token(db, user.id)
    if not verify_password(request.reset_token, user_reset_token.hashed_token):
        raise_http_exception(403, "Incorrect reset token.")

    if user_reset_token.status != "valid":
        raise_http_exception(400, "Token is no longer valid.")

    if datetime.now() > user_reset_token.expiration_time:
        crud.reset_token.update_by_pk(
            db, pk=user_reset_token.id, obj_in={"status": "expired"}
        )
        raise_http_exception(400, "Token is expired.")

    try:
        new_hashed_password = get_password_hash(request.new_password)
        crud.user.update_by_pk(
            db,
            pk=user.id,
            obj_in={"hashed_password": new_hashed_password},
            auto_commit=False,
        )
        crud.reset_token.update_by_pk(
            db, pk=user_reset_token.id, obj_in={"status": "used"}, auto_commit=False
        )
        db.commit()
        return {"message": "Successfully reset password."}

    except Exception as e:
        print(e)
        db.rollback()
        raise_http_exception(500, message="Failed to reset password.")
