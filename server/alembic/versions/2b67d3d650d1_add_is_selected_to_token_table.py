"""add_is_selected_to_token_table

Revision ID: 2b67d3d650d1
Revises: 802e8f5cfec1
Create Date: 2023-11-14 16:39:59.246319

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2b67d3d650d1'
down_revision = '802e8f5cfec1'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('token', sa.Column('is_selected', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('token', 'is_selected')
    # ### end Alembic commands ###