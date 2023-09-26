from sqlalchemy import TIMESTAMP, Column, ForeignKey, String, Boolean, or_, and_, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func, text

from .base import Base


class Role(Base):
    id = Column(UUID(as_uuid=True), server_default=text("uuid_generate_v4()"), primary_key=True)

    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspace.id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    is_default = Column(Boolean, nullable=False)

    date = Column(TIMESTAMP, server_default=func.now())

    __tablename__ = "role"

    __table_args__ = (
        CheckConstraint(
            or_(
                and_(is_default == False, workspace_id != None),
                and_(is_default == True, workspace_id == None),
            ),
            name="workspace_id_check",
        ),
    )
