from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.controllers.state.models import *


def update_status(db: Session, page_id: UUID):
    pass
