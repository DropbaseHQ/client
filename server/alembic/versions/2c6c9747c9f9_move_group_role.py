"""move_group_role

Revision ID: 2c6c9747c9f9
Revises: 036b387ef907
Create Date: 2023-10-13 15:05:15.814612

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2c6c9747c9f9'
down_revision = '036b387ef907'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('group', 'role')
    op.add_column('user_group', sa.Column('role', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user_group', 'role')
    op.add_column('group', sa.Column('role', sa.VARCHAR(), autoincrement=False, nullable=True))
    # ### end Alembic commands ###