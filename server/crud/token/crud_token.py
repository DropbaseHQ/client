from typing import Optional

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Token
from server.schemas.token import CreateToken, UpdateToken


class CRUDToken(CRUDBase[Token, CreateToken, UpdateToken]):
    def get_token_by_value(self, db: Session, token: str) -> Optional[Token]:
        return db.query(Token).filter(Token.token == token).first()


token = CRUDToken(Token)
