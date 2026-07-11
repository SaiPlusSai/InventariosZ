from sqlalchemy.orm import Session
from app.modules.dashboard.repository import dashboard_repository
from app.modules.dashboard.schemas import DashboardResponse

class DashboardService:
    def get_stats(self, db: Session) -> DashboardResponse:
        stats = dashboard_repository.get_stats(db)
        return DashboardResponse(**stats)

dashboard_service = DashboardService()
