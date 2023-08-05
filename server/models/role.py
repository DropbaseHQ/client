from sqlalchemy import TIMESTAMP, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func, text

from .base import Base


class Role(Base):
    id = Column(UUID(as_uuid=True), server_default=text("uuid_generate_v4()"), primary_key=True)

    user_id = Column(UUID, ForeignKey("user.id", ondelete="CASCADE"))
    workspace_id = Column(UUID, ForeignKey("workspace.id", ondelete="CASCADE"))
    role = Column(String, nullable=False)

    date = Column(TIMESTAMP, server_default=func.now())

    __tablename__ = "role"
