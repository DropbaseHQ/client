from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import App, Files, Page
from server.schemas.files import CreateFiles, UpdateFiles


class CRUDFiles(CRUDBase[Files, CreateFiles, UpdateFiles]):
    def get_page_files(self, db: Session, page_id: UUID) -> List[Files]:
        return db.query(Files).filter(Files.page_id == str(page_id)).order_by(Files.date).all()

    def get_page_data_fetchers(self, db: Session, page_id: UUID) -> List[Files]:
        return (
            db.query(Files)
            .filter(Files.page_id == str(page_id))
            .filter(Files.type == "data_fetchers" or Files.type == "sql")
            .order_by(Files.date)
            .all()
        )

    def get_page_file_by_name(self, db: Session, page_id: UUID, file_name: str) -> Files:
        return (
            db.query(Files)
            .join(Page, Files.page_id == Page.id)
            .filter(Page.name == file_name)
            .filter(Page.id == page_id)
            .first()
        )

    def get_workspace_id(self, db: Session, files_id: UUID) -> str:
        return (
            db.query(App.workspace_id)
            .join(Page, Page.app_id == App.id)
            .join(Files, Files.page_id == Page.id)
            .filter(Files.id == files_id)
            .one()
        ).workspace_id


files = CRUDFiles(Files)
