from uuid import UUID

from sqlalchemy.orm import Session

from server import crud
from server.controllers.state.worker_state import get_state_context


def get_state_context_payload(db: Session, page_id: UUID):
    page = crud.page.get_object_by_id_or_404(db, id=page_id)
    app = crud.app.get_app_by_page_id(db, page_id=page_id)
    db.commit()
    State, Context = get_state_context(db, page_id)
    return {
        "app_name": app.name,
        "page_name": page.name,
        "state": State.schema(),
        "context": Context.schema(),
        "status": "success",
    }
