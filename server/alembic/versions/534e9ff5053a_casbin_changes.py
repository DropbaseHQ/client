"""casbin-changes

Revision ID: 534e9ff5053a
Revises: 7223efb707d5
Create Date: 2023-09-26 15:52:31.902277

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "534e9ff5053a"
down_revision = "7223efb707d5"
branch_labels = None
depends_on = None


def upgrade():
    op.rename_table("role", "user_role")


def downgrade():
    op.rename_table("user_role", "role")
