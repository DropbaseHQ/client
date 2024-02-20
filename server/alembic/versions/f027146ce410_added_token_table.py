"""added token table

Revision ID: f027146ce410
Revises: 2c6c9747c9f9
Create Date: 2023-10-20 16:24:37.686837

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'f027146ce410'
down_revision = '2c6c9747c9f9'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('token',
    sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
    sa.Column('token', sa.String(), nullable=False),
    sa.Column('workspace_id', postgresql.UUID(as_uuid=True), nullable=True),
    sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
    sa.Column('comment', sa.String(), nullable=True),
    sa.Column('date', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['workspace_id'], ['workspace.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.drop_column('workspace', 'api_port')
    op.drop_column('workspace', 'api_token')
    op.drop_column('workspace', 'lsp_port')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('workspace', sa.Column('lsp_port', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('workspace', sa.Column('api_token', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('workspace', sa.Column('api_port', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.drop_table('token')
    # ### end Alembic commands ###