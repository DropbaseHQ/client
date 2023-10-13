from sqlalchemy import TIMESTAMP, Boolean, Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func, text

from .base import Base


class Workspace(Base):
    id = Column(UUID(as_uuid=True), server_default=text("uuid_generate_v4()"), primary_key=True)

    name = Column(String, nullable=False)
    active = Column(Boolean, default=True)
    api_token = Column(String)
    api_port = Column(String)
    lsp_port = Column(String)

    date = Column(TIMESTAMP, server_default=func.now())

    __tablename__ = "workspace"
