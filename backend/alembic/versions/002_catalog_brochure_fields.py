"""Add brochure/catalog metadata columns to tiles and colors."""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002_catalog_brochure_fields"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tiles", sa.Column("collection", sa.String(length=80), nullable=True))
    op.add_column("tiles", sa.Column("profile_style", sa.String(length=50), nullable=True))
    op.add_column("colors", sa.Column("manufacturer_code", sa.String(length=20), nullable=True))
    op.add_column("colors", sa.Column("color_type", sa.String(length=30), nullable=True))
    op.add_column("colors", sa.Column("region", sa.String(length=50), nullable=True))
    op.add_column("colors", sa.Column("source_document", sa.String(length=255), nullable=True))
    op.create_index(op.f("ix_colors_manufacturer_code"), "colors", ["manufacturer_code"], unique=False)
    op.create_index(op.f("ix_colors_region"), "colors", ["region"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_colors_region"), table_name="colors")
    op.drop_index(op.f("ix_colors_manufacturer_code"), table_name="colors")
    op.drop_column("colors", "source_document")
    op.drop_column("colors", "region")
    op.drop_column("colors", "color_type")
    op.drop_column("colors", "manufacturer_code")
    op.drop_column("tiles", "profile_style")
    op.drop_column("tiles", "collection")
