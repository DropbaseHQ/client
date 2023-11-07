from sqlalchemy import TIMESTAMP, Column, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func, text

from .base import Base


class Files(Base):
    id = Column(UUID(as_uuid=True), server_default=text("uuid_generate_v4()"), primary_key=True)

    name = Column(String)
    type = Column(String)
    source = Column(String)
    page_id = Column(UUID(as_uuid=True), ForeignKey("page.id", ondelete="CASCADE"))

    date = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (UniqueConstraint("name", "page_id", name="unique_file_name_per_page"),)

    __tablename__ = "files"
