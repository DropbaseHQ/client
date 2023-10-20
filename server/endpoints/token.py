from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from server import crud
from server.schemas.role import CreateRole, UpdateRole
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db

role_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.TOKEN)

router = APIRouter(
    prefix="/token",
    tags=["token"],
    dependencies=[Depends(role_authorizer)],
)


@router.get("/{token}")
def get_role(token: str, response: Response, db: Session = Depends(get_db)):
    token = crud.token.get_token_by_value(db, token=token)
    if not token:
        response.status_code = 404
        return {"message": "Invalid token"}
    return {"message": "Token is valid"}
