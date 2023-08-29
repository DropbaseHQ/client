from pydantic import BaseModel
from fastapi_jwt_auth import AuthJWT
from server import crud


class Settings(BaseModel):
    authjwt_secret_key: str = "secret"
    # Configure application to store and get JWT from cookies
    authjwt_token_location: set = {"cookies"}
    # Disable CSRF Protection for this example. default is True
    authjwt_cookie_csrf_protect: bool = False


@AuthJWT.load_config
def get_config():
    return Settings()


def get_current_user(Authorize: AuthJWT):
    Authorize.jwt_required()
    current_user_id = Authorize.get_jwt_subject()
    return crud.user.get_object_by_id_or_404(current_user_id)
