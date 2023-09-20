from uuid import UUID

from fastapi import HTTPException, status, Response
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session

from server import crud
from server.schemas.user import CreateUser, ReadUser, LoginUser, CreateUserRequest, ResetPasswordRequest
from server.schemas.workspace import CreateWorkspace
from server.schemas.role import CreateRole
from server.utils.helper import raise_http_exception
from server.utils.authentication import authenticate_user, get_password_hash, verify_password


def get_user(db: Session, user_email: str):
    try:
        user = crud.user.get_user_by_email(db, email=user_email)
        return ReadUser(
            id=user.id,
            name=user.name,
            email=user.email,
            trial_eligible=user.trial_eligible,
            active=user.active,
            date=user.date,
            customer_id=user.customer_id,
            subscription_id=user.subscription_id,
            status=user.status,
            plan=user.plan,
        )
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
        access_token = Authorize.create_access_token(subject=user.email)
        refresh_token = Authorize.create_refresh_token(subject=user.email)

        Authorize.set_access_cookies(access_token)
        Authorize.set_refresh_cookies(refresh_token)

        return {"msg": "Successfull login"}
        # return {"access_token": access_token, "refresh_token": refresh_token}
    except Exception as e:
        print("error", e)
        raise_http_exception(status_code=500, message="Internal server error")


def logout_user(response: Response, Authorize: AuthJWT):
    try:
        import pdb;pdb.set_trace()
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
        user_db_obj = crud.user.create(db, obj_in=user_obj)

        workspace_obj = CreateWorkspace(
            name=f"{request.name}'s Workspace",
            active=True,
        )
        workspace_db_obj = crud.workspace.create(db, obj_in=workspace_obj)

        role_obj = CreateRole(
            user_id=user_db_obj.id,
            workspace_id=workspace_db_obj.id,
            role="admin",
        )
        crud.role.create(db, obj_in=role_obj)

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
