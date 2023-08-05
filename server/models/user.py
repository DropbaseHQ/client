from sqlalchemy import TIMESTAMP, Boolean, Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func, text

from .base import Base


class User(Base):
    id = Column(UUID(as_uuid=True), server_default=text("uuid_generate_v4()"), primary_key=True)

    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    active = Column(Boolean, default=False)
    trial_eligible = Column(Boolean)

    date = Column(TIMESTAMP, server_default=func.now())

    __tablename__ = "user"
