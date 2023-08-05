from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Role
from server.schemas.role import CreateRole, UpdateRole


class CRUDRole(CRUDBase[Role, CreateRole, UpdateRole]):
    pass


role = CRUDRole(Role)
