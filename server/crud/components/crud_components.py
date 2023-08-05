from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Components
from server.schemas.components import CreateComponents, UpdateComponents


class CRUDComponents(CRUDBase[Components, CreateComponents, UpdateComponents]):
    pass


components = CRUDComponents(Components)
