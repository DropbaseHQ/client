from sqlalchemy import TIMESTAMP, Column, ForeignKey, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func, text

from .base import Base


class Token(Base):
    id = Column(
        UUID(as_uuid=True), server_default=text("uuid_generate_v4()"), primary_key=True
    )

    token = Column(String, nullable=False)
    workspace_id = Column(
        UUID(as_uuid=True), ForeignKey("workspace.id", ondelete="CASCADE")
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"))
    comment = Column(String)
    name = Column(String)
    region = Column(String)
    is_selected = Column(Boolean, default=False)
    date = Column(TIMESTAMP, server_default=func.now())

    __tablename__ = "token"
