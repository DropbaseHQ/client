from sqlalchemy import TIMESTAMP, Boolean, CheckConstraint, Column, ForeignKey, String, and_, or_
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func, text

from .base import Base


class Role(Base):
    id = Column(UUID(as_uuid=True), server_default=text("uuid_generate_v4()"), primary_key=True)

    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspace.id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    is_default = Column(Boolean, nullable=False)

    date = Column(TIMESTAMP, server_default=func.now())

    __tablename__ = "role"

    __table_args__ = (
        CheckConstraint(
            or_(
                and_(is_default is False, workspace_id is not None),
                and_(is_default is True, workspace_id is None),
            ),
            name="workspace_id_check",
        ),
    )
