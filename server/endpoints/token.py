from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from server import crud
from server.utils.connect import get_db

router = APIRouter(prefix="/token", tags=["token"])


@router.get("/{token}")
def get_role(token: str, response: Response, db: Session = Depends(get_db)):
    token = crud.token.get_token_by_value(db, token=token)
    if not token:
        response.status_code = 404
        return {"message": "Invalid token"}
    return {"message": "Token is valid"}
