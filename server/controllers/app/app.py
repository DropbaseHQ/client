from server import crud
from sqlalchemy.orm import Session
from server.utils.connect import get_db
from fastapi import APIRouter, Depends
from server.models import User


def get_user_apps(db: Session, user: User):
    first_workspace = crud.user.get_user_first_workspace(db, user.id)
    return crud.app.get_workspace_apps(db, workspace_id=first_workspace.id)
