from server.crud.base import CRUDBase
from server.models import Group


class CRUDGroup(CRUDBase[Group, Group, Group]):
    pass


group = CRUDGroup(Group)
