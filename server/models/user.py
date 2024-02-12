from sqlalchemy import TIMESTAMP, Boolean, Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func, text

from .base import Base


class User(Base):
    id = Column(UUID(as_uuid=True), server_default=text("uuid_generate_v4()"), primary_key=True)

    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=True)
    company = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    hashed_password = Column(String)
    active = Column(Boolean, default=False)
    trial_eligible = Column(Boolean, default=True)
    confirmation_token = Column(String)

    date = Column(TIMESTAMP, server_default=func.now())

    __tablename__ = "user"
