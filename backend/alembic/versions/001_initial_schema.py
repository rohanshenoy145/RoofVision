"""Initial schema — manufacturers, tiles, colors, visualizations."""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "manufacturers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=True),
        sa.Column("material_type", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_manufacturers_id"), "manufacturers", ["id"], unique=False)
    op.create_index(op.f("ix_manufacturers_material_type"), "manufacturers", ["material_type"], unique=False)
    op.create_index(op.f("ix_manufacturers_name"), "manufacturers", ["name"], unique=False)
    op.create_index(op.f("ix_manufacturers_slug"), "manufacturers", ["slug"], unique=True)

    op.create_table(
        "tiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("manufacturer_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("slug", sa.String(length=150), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["manufacturer_id"], ["manufacturers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tiles_id"), "tiles", ["id"], unique=False)
    op.create_index(op.f("ix_tiles_manufacturer_id"), "tiles", ["manufacturer_id"], unique=False)
    op.create_index(op.f("ix_tiles_name"), "tiles", ["name"], unique=False)
    op.create_index(op.f("ix_tiles_slug"), "tiles", ["slug"], unique=False)

    op.create_table(
        "colors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tile_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("hex_code", sa.String(length=7), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["tile_id"], ["tiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_colors_id"), "colors", ["id"], unique=False)
    op.create_index(op.f("ix_colors_name"), "colors", ["name"], unique=False)
    op.create_index(op.f("ix_colors_tile_id"), "colors", ["tile_id"], unique=False)

    op.create_table(
        "visualizations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("image_path", sa.String(length=255), nullable=False),
        sa.Column("manufacturer_id", sa.Integer(), nullable=False),
        sa.Column("tile_id", sa.Integer(), nullable=False),
        sa.Column("color_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("result_path", sa.String(length=255), nullable=True),
        sa.Column("error_message", sa.String(length=500), nullable=True),
        sa.Column("generator", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_visualizations_id"), "visualizations", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_visualizations_id"), table_name="visualizations")
    op.drop_table("visualizations")
    op.drop_index(op.f("ix_colors_tile_id"), table_name="colors")
    op.drop_index(op.f("ix_colors_name"), table_name="colors")
    op.drop_index(op.f("ix_colors_id"), table_name="colors")
    op.drop_table("colors")
    op.drop_index(op.f("ix_tiles_slug"), table_name="tiles")
    op.drop_index(op.f("ix_tiles_name"), table_name="tiles")
    op.drop_index(op.f("ix_tiles_manufacturer_id"), table_name="tiles")
    op.drop_index(op.f("ix_tiles_id"), table_name="tiles")
    op.drop_table("tiles")
    op.drop_index(op.f("ix_manufacturers_slug"), table_name="manufacturers")
    op.drop_index(op.f("ix_manufacturers_name"), table_name="manufacturers")
    op.drop_index(op.f("ix_manufacturers_material_type"), table_name="manufacturers")
    op.drop_index(op.f("ix_manufacturers_id"), table_name="manufacturers")
    op.drop_table("manufacturers")
