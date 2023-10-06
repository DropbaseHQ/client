from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import UserGroup
from server.schemas.user import CreateUser, UpdateUser


class CRUDUserGroup(CRUDBase[UserGroup, UserGroup, UserGroup]):
    def get_user_groups(self, db: Session, user_id: str):
        return db.query(UserGroup.group_id).filter(UserGroup.user_id == user_id).all()


user_group = CRUDUserGroup(UserGroup)
