from sqlalchemy import ARRAY, TIMESTAMP, Column, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func, text

from .base import Base


class Tables(Base):
    id = Column(UUID(as_uuid=True), server_default=text("uuid_generate_v4()"), primary_key=True)

    name = Column(String, nullable=False)
    property = Column(JSONB)
    file_id = Column(UUID(as_uuid=True), ForeignKey("files.id", ondelete="SET NULL"))
    page_id = Column(UUID(as_uuid=True), ForeignKey("page.id", ondelete="CASCADE"))
    depends_on = Column(ARRAY(String))

    date = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (UniqueConstraint("name", "page_id", name="unique_table_name_per_page"),)

    __tablename__ = "tables"
