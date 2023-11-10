from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Group
from server.schemas.user import CreateUser, UpdateUser


class CRUDGroup(CRUDBase[Group, Group, Group]):
    pass


group = CRUDGroup(Group)
