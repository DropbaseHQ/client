from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import App, DataFetcher, Page
from server.schemas.data_fetcher import CreateDataFetcher, UpdateDataFetcher


class CRUDDataFetcher(CRUDBase[DataFetcher, CreateDataFetcher, UpdateDataFetcher]):
    def get_page_data_fetcher(self, db: Session, page_id: UUID) -> List[DataFetcher]:
        return (
            db.query(DataFetcher)
            .filter(DataFetcher.page_id == str(page_id))
            .order_by(DataFetcher.date)
            .all()
        )

    def get_page_file_by_name(self, db: Session, page_id: UUID, file_name: str) -> DataFetcher:
        return (
            db.query(DataFetcher)
            .join(Page, DataFetcher.page_id == Page.id)
            .filter(Page.name == file_name)
            .filter(Page.id == page_id)
            .first()
        )

    def get_workspace_id(self, db: Session, data_fetcher_id: UUID) -> str:
        return (
            db.query(App.workspace_id)
            .join(Page, Page.app_id == App.id)
            .join(DataFetcher, DataFetcher.page_id == Page.id)
            .filter(DataFetcher.id == data_fetcher_id)
            .one()
        ).workspace_id


data_fetcher = CRUDDataFetcher(DataFetcher)
