import os
import secrets
import requests
from datetime import datetime, timedelta
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse
from uuid import UUID
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from server.controllers.user.github_social_controller import GithubController

from fastapi import HTTPException, Response, status, Request
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session

from server import crud
from server.constants import (
    ACCESS_TOKEN_EXPIRE_SECONDS,
    CLIENT_URL,
    REFRESH_TOKEN_EXPIRE_SECONDS,
)
from server.controllers.policy import (
    PolicyUpdater,
    format_permissions_for_highest_action,
)
from server.controllers.user.workspace_creator import WorkspaceCreator
from server.emails.emailer import send_email
from server.models import Policy, User, Workspace
from server.schemas.user import (
    AddPolicyRequest,
    CheckPermissionRequest,
    CreateGoogleUserRequest,
    CreateUser,
    CreateUserRequest,
    LoginGoogleUser,
    LoginUser,
    OnboardUser,
    ReadUser,
    ResetPasswordRequest,
    UpdateUserPolicyRequest,
)
from server.schemas.workspace import ReadWorkspace
from server.utils.authentication import (
    get_password_hash,
    verify_password,
)
from server.utils.hash import get_confirmation_token_hash
from server.utils.helper import raise_http_exception
from server.utils.loops_integration import loops_controller
from server.utils.permissions.casbin_utils import (
    get_all_action_permissions,
    get_contexted_enforcer,
)
from server.utils.slack import slack_sign_up


def get_user(db: Session, user_email: str):
    try:
        return crud.user.get_user_by_email(db, email=user_email)
    except Exception as e:
        print("error", e)
        raise_http_exception(status_code=404, message="User not found")


def login_user(db: Session, Authorize: AuthJWT, request: LoginUser):
    try:
        user = crud.user.get_user_by_email(db, email=request.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if user.social_login is not None and user.social_login != "":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account not registered with email",
            )
        if not verify_password(request.password, user.hashed_password):
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
            subject=user.email,
            expires_time=ACCESS_TOKEN_EXPIRE_SECONDS,
            user_claims={"user_id": str(user.id)},
        )
        refresh_token = Authorize.create_refresh_token(
            subject=user.email, expires_time=REFRESH_TOKEN_EXPIRE_SECONDS
        )

        # Authorize.set_access_cookies(access_token)
        # response = Authorize._response
        # Set Access Cookie
        # response.set_cookie(
        #     Authorize._access_cookie_key,
        #     access_token,
        #     max_age=Authorize._cookie_max_age,
        #     path=Authorize._access_cookie_path,
        #     domain=Authorize._cookie_domain,
        #     secure=Authorize._cookie_secure,
        #     httponly=False,
        #     samesite=Authorize._cookie_samesite,
        # )
        # Authorize.set_refresh_cookies(refresh_token)
        # Set Refresh Cookie
        # response.set_cookie(
        #     Authorize._refresh_cookie_key,
        #     refresh_token,
        #     max_age=Authorize._cookie_max_age,
        #     path=Authorize._refresh_cookie_path,
        #     domain=Authorize._cookie_domain,
        #     secure=Authorize._cookie_secure,
        #     httponly=False,
        #     samesite=Authorize._cookie_samesite,
        # )
        workspaces = crud.workspace.get_user_workspaces(db, user_id=user.id)
        workspace = (
            ReadWorkspace.from_orm(workspaces[0]) if len(workspaces) > 0 else None
        )
        return {
            "user": ReadUser.from_orm(user),
            "workspace": workspace,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "onboarding": not user.onboarded,
        }

    except HTTPException as e:
        raise_http_exception(status_code=e.status_code, message=e.detail)
    except Exception as e:
        print("error", e)
        raise_http_exception(status_code=500, message="Internal server error")


def login_google_user(db: Session, Authorize: AuthJWT, request: LoginGoogleUser):
    try:
        token = request.credential

        CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

        if CLIENT_ID is None:
            raise ValueError("GOOGLE_CLIENT_ID environment variable not set")

        idinfo = id_token.verify_oauth2_token(
            token, google_requests.Request(), CLIENT_ID
        )

        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Wrong issuer")

        user = crud.user.get_user_by_email(db, email=idinfo["email"])

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User does not exist",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if user.social_login != "google":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account not registered with Google",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = Authorize.create_access_token(
            subject=user.email,
            expires_time=ACCESS_TOKEN_EXPIRE_SECONDS,
            user_claims={"user_id": str(user.id)},
        )
        refresh_token = Authorize.create_refresh_token(
            subject=user.email, expires_time=REFRESH_TOKEN_EXPIRE_SECONDS
        )

        workspaces = crud.workspace.get_user_workspaces(db, user_id=user.id)
        workspace = (
            ReadWorkspace.from_orm(workspaces[0]) if len(workspaces) > 0 else None
        )

        return {
            "user": ReadUser.from_orm(user),
            "workspace": workspace,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "onboarding": False if user.onboarded else {
                "name": idinfo.get("given_name", user.name),
                "last_name": idinfo.get("last_name", user.last_name),
            },
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
        all_claims = Authorize.get_raw_jwt()
        user_id = all_claims.get("user_id")
        new_access_token = Authorize.create_access_token(
            subject=current_user, user_claims={"user_id": user_id}
        )
        return {"msg": "Successfully refresh token", "access_token": new_access_token}
    except Exception as e:
        print("error", e)
        raise_http_exception(status_code=500, message="Internal server error")


def register_user(db: Session, request: CreateUserRequest):
    try:
        hashed_password = get_password_hash(request.password)
        confirmation_token = get_confirmation_token_hash(
            request.email + hashed_password
        )

        user_obj = CreateUser(
            name="",
            last_name="",
            company="",
            email=request.email,
            hashed_password=hashed_password,
            trial_eligible=True,
            active=False,
            confirmation_token=confirmation_token,
            onboarded=False
        )
        user = crud.user.create(db, obj_in=user_obj, auto_commit=False)
        db.flush()
        workspace_creator = WorkspaceCreator(db=db, user_id=user.id)
        workspace_creator.create()

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


def register_google_user(
    db: Session, Authorize: AuthJWT, request: CreateGoogleUserRequest
):
    try:
        token = request.credential

        CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

        if CLIENT_ID is None:
            raise ValueError("GOOGLE_CLIENT_ID environment variable not set")

        idinfo = id_token.verify_oauth2_token(
            token, google_requests.Request(), CLIENT_ID
        )

        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Wrong issuer")

        user = crud.user.get_user_by_email(db, email=idinfo.get("email"))

        if user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="An account with this email already exists",
                headers={"WWW-Authenticate": "Bearer"},
            )

        name = idinfo.get("given_name") or idinfo.get("name")
        last = idinfo.get("family_name")
        domain = idinfo.get("hd", None)
        email = idinfo.get("email")

        company = domain if domain is not None else "Personal"

        user_obj = CreateUser(
            name=name,
            last_name=last,
            company=company,
            email=email,
            hashed_password="",
            trial_eligible=True,
            active=True,
            social_login="google",
            onboarded=False
        )
        user = crud.user.create(db, obj_in=user_obj, auto_commit=False)
        db.flush()
        workspace_creator = WorkspaceCreator(db=db, user_id=user.id)
        workspace_creator.create()

        db.commit()

        slack_sign_up(name=name, email=email)

        access_token = Authorize.create_access_token(
            subject=user.email,
            expires_time=ACCESS_TOKEN_EXPIRE_SECONDS,
            user_claims={"user_id": str(user.id)},
        )
        refresh_token = Authorize.create_refresh_token(
            subject=user.email, expires_time=REFRESH_TOKEN_EXPIRE_SECONDS
        )

        workspaces = crud.workspace.get_user_workspaces(db, user_id=user.id)
        workspace = (
            ReadWorkspace.from_orm(workspaces[0]) if len(workspaces) > 0 else None
        )
        return {
            "user": ReadUser.from_orm(user),
            "workspace": workspace,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "onboarding": {
                "name": name,
                "last_name": last,
            },
        }

    except HTTPException as e:
        raise_http_exception(status_code=e.status_code, message=e.detail)
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
            db.commit()
            return {"message": "User successfully confirmed"}
        except Exception as e:
            db.rollback()
            print("error", e)
            raise_http_exception(status_code=500, message="Internal server error")
    raise_http_exception(status_code=404, message="User not found")


def onboard_user(db: Session, request: OnboardUser, user_id: UUID):
    user = crud.user.get_object_by_id_or_404(db, id=user_id)

    try:
        user.active = True
        user.onboarded = True
        user.name = request.name
        user.last_name = request.last_name
        user.company = request.company
        db.commit()

        loops_controller.add_user(
            user_email=user.email,
            name=user.name,
            last_name=user.last_name,
            company=user.company,
            user_id=str(user.id),
        )
    except Exception as e:
        db.rollback()
        print("error", e)
        raise_http_exception(status_code=500, message="Internal server error")

    return {"message": "User successfully onboarded"}


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
                "in_trial": workspace.in_trial,
                "trial_end_date": workspace.trial_end_date,
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


def delete_user(db: Session, user_id: UUID):
    try:
        # user = crud.user.get_object_by_id_or_404(db, id=user_id)
        crud.user.remove(db, id=user_id, auto_commit=False)
        user_owned_workspaces = crud.workspace.get_user_owned_workspaces(
            db, user_id=user_id
        )
        for workspace in user_owned_workspaces:
            crud.workspace.remove(db, id=workspace.id, auto_commit=False)
        db.commit()
    except Exception:
        db.rollback()
        raise_http_exception(status_code=500, message="Internal server error")
    return {"message": "User successfully deleted"}


def check_permissions(
    db: Session, user: User, request: CheckPermissionRequest, workspace: Workspace
):
    workspace_id = None
    app_id = request.app_id
    app = crud.app.get_object_by_id_or_404(db, id=app_id)
    if app.workspace_id:
        workspace_id = app.workspace_id
    else:
        # Workspace_from_token
        workspace_id = workspace.id

    permissions_dict = get_all_action_permissions(
        db, str(user.id), workspace_id, app_id
    )
    return permissions_dict


def github_auth(db: Session, Authorize: AuthJWT, code: str):
    github_controller = GithubController()
    access_token = github_controller.verify_github_auth_code(code)

    # Get user information from github
    user_info = github_controller.get_user_info(access_token)
    email = user_info.get("email")
    if not email:
        email = github_controller.get_user_primary_email(access_token)

    if not email:
        raise_http_exception(400, "User email not found")

    user = crud.user.get_user_by_email(db, email=email)
    name = user_info.get("name")
    if not name:
        name = user_info.get("login")
    # If user does not exist, create user and workspace
    if not user:
        user_obj = CreateUser(
            name=name,
            email=email,
            company=user_info.get("company"),
            trial_eligible=True,
            active=False,
            social_login="github",
        )
        user = crud.user.create(db, obj_in=user_obj, auto_commit=False)
        db.flush()
        workspace_creator = WorkspaceCreator(db=db, user_id=user.id)
        workspace_creator.create()
        slack_sign_up(name=user.name, email=user.email)
        loops_controller.add_user(
            user_email=email,
            name=user.name,
            last_name=user.last_name,
            company=user.company,
            user_id=str(user.id),
        )
        db.commit()
    if user.social_login != "github":
        raise_http_exception(400, "Email is already registered with another provider")

    # If user exists, create a JWT token
    access_token = Authorize.create_access_token(
        subject=str(user.email), user_claims={"github_access_token": access_token}
    )
    refresh_token = Authorize.create_refresh_token(
        subject=str(user.email), user_claims={"github_access_token": access_token}
    )
    return {"access_token": access_token, "refresh_token": refresh_token}
