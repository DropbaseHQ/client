from sqlalchemy import TIMESTAMP, Column, ForeignKey, PrimaryKeyConstraint, String
from sqlalchemy.sql import func

from .base import Base


class WorkerStatus(Base):
    token = Column(String, ForeignKey("token.token", ondelete="SET NULL"))
    version = Column(String)
    date = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (PrimaryKeyConstraint("token", "date"),)
    __tablename__ = "worker_status"
