import secrets
from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from server import crud
from server.schemas.url_mapping import CreateURLMapping, UpdateURLMapping
from server.utils.connect import get_db

router = APIRouter(prefix="/url_mapping", tags=["url_mapping"])
