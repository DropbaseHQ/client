from uuid import UUID

from fastapi import HTTPException, status
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session

from server import crud
from server.schemas.user import CreateUser, ReadUser
from server.utils.helper import raise_http_exception
from server.models import User


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


def login_user(user: User, Authorize: AuthJWT):
    try:
        access_token = Authorize.create_access_token(subject=user.email)
        refresh_token = Authorize.create_refresh_token(subject=user.email)

        Authorize.set_access_cookies(access_token)
        Authorize.set_refresh_cookies(refresh_token)

        return {"msg": "Successfully login"}
        # return {"access_token": access_token, "refresh_token": refresh_token}
    except Exception as e:
        print("error", e)
        raise_http_exception(status_code=500, message="Internal server error")


def logout_user(Authorize: AuthJWT):
    try:
        Authorize.jwt_required()
        Authorize.unset_jwt_cookies()
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
