from fastapi import APIRouter

from app.api import health, manufacturers, tiles, colors, visualizations

router = APIRouter()

# Include route modules
router.include_router(health.router)
router.include_router(manufacturers.router)
router.include_router(tiles.router)
router.include_router(colors.router)
router.include_router(visualizations.router)
