from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from server import crud
from server.schemas import CreateAppRequest
from server.utils.connect import get_db

router = APIRouter(prefix="/app", tags=["app"])


@router.post("/")
def create_app(request: CreateAppRequest, db: Session = Depends(get_db)):
    if not request:
        raise HTTPException(status_code=400, detail="Invalid request")

    return crud.app.create(db, obj_in=request.dict())
