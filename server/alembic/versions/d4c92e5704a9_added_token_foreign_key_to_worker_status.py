"""added token foreign key to worker status

Revision ID: d4c92e5704a9
Revises: a3262eb43cfc
Create Date: 2023-12-04 14:16:06.317279

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = 'd4c92e5704a9'
down_revision = 'a3262eb43cfc'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint(None, 'token', ['token'])
    op.create_foreign_key(None, 'worker_status', 'token', ['token'], ['token'], ondelete='SET NULL')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'worker_status', type_='foreignkey')
    op.drop_constraint(None, 'token', type_='unique')
    # ### end Alembic commands ###
