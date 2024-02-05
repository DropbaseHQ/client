"""modify-tokens-table-for-workspace-identifcation

Revision ID: 87db053768d2
Revises: 5f994e35278e
Create Date: 2024-02-05 18:23:31.511809

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "87db053768d2"
down_revision = "5f994e35278e"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("token", sa.Column("is_active", sa.Boolean(), nullable=True))
    op.add_column("token", sa.Column("type", sa.String(), nullable=True))
    op.drop_constraint("token_user_id_fkey", "token", type_="foreignkey")
    op.drop_column("token", "is_selected")
    op.drop_column("token", "comment")
    op.drop_column("token", "user_id")
    op.drop_column("token", "region")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "token", sa.Column("region", sa.VARCHAR(), autoincrement=False, nullable=True)
    )
    op.add_column(
        "token",
        sa.Column("user_id", postgresql.UUID(), autoincrement=False, nullable=True),
    )
    op.add_column(
        "token", sa.Column("comment", sa.VARCHAR(), autoincrement=False, nullable=True)
    )
    op.add_column(
        "token",
        sa.Column("is_selected", sa.BOOLEAN(), autoincrement=False, nullable=True),
    )
    op.create_foreign_key(
        "token_user_id_fkey", "token", "user", ["user_id"], ["id"], ondelete="CASCADE"
    )
    op.drop_column("token", "type")
    op.drop_column("token", "is_active")
    # ### end Alembic commands ###
