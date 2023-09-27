from fastapi import HTTPException, Response, status
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session

from server import crud
from server.constants import ACCESS_TOKEN_EXPIRE_SECONDS, REFRESH_TOKEN_EXPIRE_SECONDS
from server.schemas.user_role import CreateUserRole
from server.schemas.user import CreateUser, CreateUserRequest, LoginUser, ReadUser, ResetPasswordRequest
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
        workspace = crud.workspace.create(db, obj_in=workspace_obj)
        # TODO: get admin role id from db
        admin_role_id = "a1f129ef-3474-4aa9-93e0-2aa3ab13181c"
        role_obj = CreateUserRole(
            user_id=user.id,
            workspace_id=workspace.id,
            role_id=admin_role_id,
        )
        crud.user_role.create(db, obj_in=role_obj)

        return {"message": "User successfully registered"}
    except Exception as e:
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
