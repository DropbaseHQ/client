"""user_role_table_points_to_role_table

Revision ID: 15235877d26e
Revises: eb43b0221253
Create Date: 2023-09-26 16:22:27.448846

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '15235877d26e'
down_revision = 'eb43b0221253'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user_role', sa.Column('role_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(None, 'user_role', 'role', ['role_id'], ['id'], ondelete='CASCADE')
    op.drop_column('user_role', 'role')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user_role', sa.Column('role', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.drop_constraint(None, 'user_role', type_='foreignkey')
    op.drop_column('user_role', 'role_id')
    # ### end Alembic commands ###