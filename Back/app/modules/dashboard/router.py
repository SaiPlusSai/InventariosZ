from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.dashboard.schemas import DashboardResponse
from app.modules.dashboard.service import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Obtiene los indicadores ejecutivos (KPI) para el Dashboard.
    Incluye estadisticas de Productos, Inventario, Catalogo y Calidad.
    """
    return dashboard_service.get_stats(db)
