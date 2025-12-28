"""add specialization to user

Revision ID: add_specialization_user
Revises: 9c7a0f041c2b
Create Date: 2025-12-27 08:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_specialization_user'
down_revision: Union[str, None] = '9c7a0f041c2b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add specialization column to users table
    op.add_column('users', sa.Column('specialization', sa.String(length=100), nullable=True))


def downgrade() -> None:
    # Remove specialization column from users table
    op.drop_column('users', 'specialization')

