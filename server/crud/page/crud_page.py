from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Page
from server.schemas.page import CreatePage, UpdatePage


class CRUDPage(CRUDBase[Page, CreatePage, UpdatePage]):
    pass


page = CRUDPage(Page)
