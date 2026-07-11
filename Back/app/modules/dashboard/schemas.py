from pydantic import BaseModel

class DashboardStatsResponse(BaseModel):
    ventas_hoy: int
    compras_hoy: int
    perdidas_hoy: int
    total_productos: int
    total_marcas: int
    stock_total: int
    sin_stock: int
