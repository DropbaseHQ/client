from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Page, Action, Page, App
from server.schemas.page import CreatePage, UpdatePage


class CRUDPage(CRUDBase[Page, CreatePage, UpdatePage]):
    def get_workspace_id(self, db: Session, page_id: UUID) -> str:
        return (
            db.query(App.workspace_id)
            .join(Page, Page.id == Action.page_id)
            .filter(Action.id == str(page_id))
            .one()
        ).workspace_id


page = CRUDPage(Page)
