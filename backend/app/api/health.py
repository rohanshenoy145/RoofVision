from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health_check():
    """Liveness: process is up (no DB dependency — for load balancers)."""
    return {"status": "ok", "service": "RoofVision API"}


@router.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    """
    Readiness: database reachable. Returns 503 if DB is down (Kubernetes-style).
    """
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready", "service": "RoofVision API", "database": "ok"}
    except Exception:
        raise HTTPException(status_code=503, detail="database unavailable")
