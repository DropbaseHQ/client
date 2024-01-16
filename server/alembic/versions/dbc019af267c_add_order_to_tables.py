"""add_order_to_tables

Revision ID: dbc019af267c
Revises: cf5824edda6e
Create Date: 2023-12-20 13:47:43.046008

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dbc019af267c'
down_revision = 'cf5824edda6e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('tables', sa.Column('order', sa.INTEGER(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('tables', 'order')
    # ### end Alembic commands ###
