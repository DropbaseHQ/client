"""add_order_to_components

Revision ID: cf5824edda6e
Revises: d4c92e5704a9
Create Date: 2023-12-19 14:57:32.710900

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cf5824edda6e'
down_revision = 'd4c92e5704a9'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('components', sa.Column('order', sa.INTEGER(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('components', 'order')
    # ### end Alembic commands ###