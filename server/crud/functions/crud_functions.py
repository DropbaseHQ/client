from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Functions, Action, Page, App
from server.schemas.functions import CreateFunctions, UpdateFunctions


class CRUDFunctions(CRUDBase[Functions, CreateFunctions, UpdateFunctions]):
    def get_action_functions(self, db: Session, action_id: UUID) -> List[Functions]:
        return (
            db.query(Functions)
            .filter(Functions.action_id == str(action_id))
            .order_by(Functions.date)
            .all()
        )

    def get_workspace_id(self, db: Session, functions_id: UUID) -> str:
        return (
            db.query(App.workspace_id)
            .join(Page, Page.id == Action.page_id)
            .join(Action, Action.page_id == Page.id)
            .join(Functions, Functions.action_id == Action.id)
            .filter(Action.id == str(functions_id))
            .one()
        ).workspace_id


functions = CRUDFunctions(Functions)
