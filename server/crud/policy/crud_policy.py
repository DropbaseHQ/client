from server.crud.base import CRUDBase
from server.models import Policy


class CRUDPolicy(CRUDBase[Policy, Policy, Policy]):
    pass


policy = CRUDPolicy(Policy)
