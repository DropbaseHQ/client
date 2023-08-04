from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import User
from server.schemas.user import CreateUser, UpdateUser


class CRUDUser(CRUDBase[User, CreateUser, UpdateUser]):
    def update_user_refresh_token(self, db: Session, user_id: str, refresh_token: str):
        user = self.get(db, user_id)
        self.update(db, db_obj=user, obj_in={"refresh_token": refresh_token})
        db.commit()


user = CRUDUser(User)
