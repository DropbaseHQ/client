from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Policy
from server.schemas.user import CreateUser, UpdateUser


class CRUDPolicy(CRUDBase[Policy, Policy, Policy]):
    pass


policy = CRUDPolicy(Policy)
