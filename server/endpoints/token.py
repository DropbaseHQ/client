import secrets
from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from server import crud
from server.schemas.token import CreateToken, UpdateTokenInfo
from server.utils.connect import get_db

router = APIRouter(prefix="/token", tags=["token"])

# TODO add auth


@router.post("/")
def create_token(request: CreateToken, db: Session = Depends(get_db)):
    request.token = secrets.token_urlsafe(32)
    return crud.token.create(db, obj_in=request)


@router.get("/{workspace_id}/{user_id}")
def get_user_tokens_in_workspace(
    workspace_id: UUID, user_id: UUID, db: Session = Depends(get_db)
):
    workspace_owner = crud.user_role.get_workspace_owner(db, workspace_id)
    owner_id = workspace_owner.user_id
    return [
        {
            "token": token.token,
            "token_id": token.id,
            "is_selected": token.is_selected,
            "owner_selected": token.is_selected and token.user_id == owner_id,
        }
        for token in crud.token.get_user_tokens_in_workspace(db, workspace_id, user_id)
    ]


@router.get("/{token}")
def verify_token(token: str, response: Response, db: Session = Depends(get_db)):
    token = crud.token.get_token_by_value(db, token=token)
    if not token:
        response.status_code = 404
        return {"message": "Invalid token"}
    return {"message": "Token is valid"}


@router.put("/{token_id}")
def update_token(
    token_id: UUID, request: UpdateTokenInfo, db: Session = Depends(get_db)
):
    return crud.token.update(db, id=token_id, obj_in=request.dict())


@router.delete("/{token_id}")
def delete_token(token_id: UUID, db: Session = Depends(get_db)):
    return crud.token.remove(db, id=token_id)
