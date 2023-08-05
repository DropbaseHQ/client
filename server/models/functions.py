from sqlalchemy import TIMESTAMP, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func, text

from .base import Base


class Functions(Base):
    id = Column(UUID(as_uuid=True), server_default=text("uuid_generate_v4()"), primary_key=True)

    code = Column(String, nullable=False)
    app_id = Column(UUID, ForeignKey("app.id", ondelete="CASCADE"))

    date = Column(TIMESTAMP, server_default=func.now())

    __tablename__ = "functions"
