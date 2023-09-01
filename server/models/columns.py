from sqlalchemy import TIMESTAMP, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func, text

from .base import Base


class Columns(Base):
    id = Column(UUID(as_uuid=True), server_default=text("uuid_generate_v4()"), primary_key=True)

    name = Column(String, nullable=False)
    property = Column(JSONB)

    type = Column(String)
    table_id = Column(UUID(as_uuid=True), ForeignKey("tables.id", ondelete="CASCADE"))

    date = Column(TIMESTAMP, server_default=func.now())

    __tablename__ = "columns"
