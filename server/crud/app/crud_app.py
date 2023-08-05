from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import App
from server.schemas.app import CreateApp, UpdateApp


class CRUDApp(CRUDBase[App, CreateApp, UpdateApp]):
    pass


app = CRUDApp(App)
