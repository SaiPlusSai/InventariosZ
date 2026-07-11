from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.dashboard.schemas import DashboardStatsResponse
from app.modules.dashboard.service import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Obtiene las métricas del dashboard (estadísticas del día e inventario actual).
    """
    return dashboard_service.get_stats(db)
