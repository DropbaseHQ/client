from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Token
from server.schemas.token import CreateToken, UpdateToken


class CRUDToken(CRUDBase[Token, CreateToken, UpdateToken]):
    def get_user_tokens_in_workspace(self, db: Session, workspace_id: UUID, user_id: UUID):
        return (
            db.query(Token)
            .filter(Token.workspace_id == workspace_id)
            .filter(Token.user_id == user_id)
        ).all()

    def get_token_by_value(self, db: Session, token: str) -> Optional[Token]:
        return db.query(Token).filter(Token.token == token).first()


token = CRUDToken(Token)
