from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health_check():
    """Basic health check endpoint."""
    return {"status": "ok", "service": "RoofVision API"}
