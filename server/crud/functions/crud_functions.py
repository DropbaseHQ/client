from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import App, Functions, Page, Widget
from server.schemas.functions import CreateFunctions, UpdateFunctions


class CRUDFunctions(CRUDBase[Functions, CreateFunctions, UpdateFunctions]):
    def get_page_functions(self, db: Session, page_id: UUID) -> List[Functions]:
        return (
            db.query(Functions).filter(Functions.page_id == str(page_id)).order_by(Functions.date).all()
        )

    def get_workspace_id(self, db: Session, functions_id: UUID) -> str:
        return (
            db.query(App.workspace_id)
            .join(Page, Page.id == Widget.page_id)
            .join(Widget, Widget.page_id == Page.id)
            .join(Functions, Functions.page_id == Widget.id)
            .filter(Widget.id == str(functions_id))
            .one()
        ).workspace_id


functions = CRUDFunctions(Functions)
