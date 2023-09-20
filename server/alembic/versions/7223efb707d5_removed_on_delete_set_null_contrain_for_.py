"""removed on delete set null contrain for component

Revision ID: 7223efb707d5
Revises: 19d1218f9bca
Create Date: 2023-09-20 14:33:57.526587

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = '7223efb707d5'
down_revision = '19d1218f9bca'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('components_after_fkey', 'components', type_='foreignkey')
    op.create_foreign_key(None, 'components', 'components', ['after'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'components', type_='foreignkey')
    op.create_foreign_key('components_after_fkey', 'components', 'components', ['after'], ['id'], ondelete='SET NULL')
    # ### end Alembic commands ###
