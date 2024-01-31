from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from server import crud
from server.schemas import CreatePageRequest
from server.utils.connect import get_db

router = APIRouter(prefix="/page", tags=["page"])


@router.post("/")
def create_page(request: CreatePageRequest, db: Session = Depends(get_db)):
    if not request:
        raise HTTPException(status_code=400, detail="Invalid request")

    return crud.page.create(db, obj_in=request.dict())
