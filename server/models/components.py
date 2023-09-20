from sqlalchemy import TIMESTAMP, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func, text

from .base import Base


class Components(Base):
    id = Column(UUID(as_uuid=True), server_default=text("uuid_generate_v4()"), primary_key=True)

    property = Column(JSONB)
    widget_id = Column(UUID(as_uuid=True), ForeignKey("widget.id", ondelete="CASCADE"))
    after = Column(UUID(as_uuid=True), ForeignKey("components.id"))
    type = Column(String)

    date = Column(TIMESTAMP, server_default=func.now())

    __tablename__ = "components"
