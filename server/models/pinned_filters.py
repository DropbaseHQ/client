from sqlalchemy import TIMESTAMP, Column, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func, text

from .base import Base


class PinnedFilters(Base):
    id = Column(UUID(as_uuid=True), server_default=text("uuid_generate_v4()"), primary_key=True)

    filters = Column(JSONB, nullable=False)
    sorts = Column(JSONB, nullable=False)

    sql_id = Column(UUID(as_uuid=True), ForeignKey("tables.id", ondelete="CASCADE"), nullable=False)

    date = Column(TIMESTAMP, server_default=func.now())

    __tablename__ = "pinned_filters"
