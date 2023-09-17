from fastapi import Depends
from fastapi_jwt_auth import AuthJWT
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session

from server import crud
from server.utils.connect import get_db


class Settings(BaseModel):
    authjwt_secret_key: str = "secret"
    # Configure application to store and get JWT from cookies
    authjwt_token_location: set = {"cookies"}
    # Disable CSRF Protection for this example. default is True
    authjwt_cookie_csrf_protect: bool = False
    authjwt_cookie_secure: bool = True
    authjwt_cookie_samesite: str = "none"


@AuthJWT.load_config
def get_config():
    return Settings()


def get_current_user_email(Authorize: AuthJWT = Depends()) -> str:
    return "az@dropbase.io"
    # return Authorize.get_jwt_subject()


def get_current_user(db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_email)):
    return crud.user.get_user_by_email(db, email=current_user_id)


# to get a string like this run:
# openssl rand -hex 32

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def authenticate_user(db: Session, email: str, password: str):
    user = crud.user.get_user_by_email(db, email=email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user
