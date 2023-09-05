from sqlalchemy import TIMESTAMP, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func, text

from .base import Base


class Widget(Base):
    id = Column(UUID(as_uuid=True), server_default=text("uuid_generate_v4()"), primary_key=True)

    name = Column(String, nullable=False)
    property = Column(JSONB)
    page_id = Column(UUID(as_uuid=True), ForeignKey("page.id", ondelete="CASCADE"))

    date = Column(TIMESTAMP, server_default=func.now())

    __tablename__ = "widget"
