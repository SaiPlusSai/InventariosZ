from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, time
from app.modules.movimiento_inventario.models import MovimientoInventario
from app.modules.movimiento_inventario.constants import TipoMovimiento
from app.modules.producto.models import Producto
from app.modules.marca.models import Marca
from app.modules.dashboard.schemas import DashboardStatsResponse

class DashboardService:
    def get_stats(self, db: Session) -> DashboardStatsResponse:
        hoy_inicio = datetime.combine(datetime.today(), time.min)

        # 1. Movimientos de hoy
        movimientos_hoy = db.query(
            MovimientoInventario.tipo_movimiento,
            MovimientoInventario.origen,
            func.sum(MovimientoInventario.cantidad).label('total_cantidad')
        ).filter(
            MovimientoInventario.created_at >= hoy_inicio
        ).group_by(
            MovimientoInventario.tipo_movimiento,
            MovimientoInventario.origen
        ).all()

        ventas_hoy = 0
        compras_hoy = 0
        perdidas_hoy = 0

        for mov in movimientos_hoy:
            if mov.tipo_movimiento == TipoMovimiento.SALIDA.value and mov.origen == 'VENTA':
                ventas_hoy += mov.total_cantidad
            elif mov.tipo_movimiento == TipoMovimiento.ENTRADA.value and mov.origen == 'COMPRA':
                compras_hoy += mov.total_cantidad
            elif mov.tipo_movimiento == TipoMovimiento.SALIDA.value and mov.origen.startswith('MERMA'):
                perdidas_hoy += mov.total_cantidad

        # 2. Productos
        total_productos = db.query(func.count(Producto.id)).filter(Producto.estado == True).scalar() or 0
        
        # 3. Marcas
        total_marcas = db.query(func.count(Marca.id)).filter(Marca.estado == True).scalar() or 0
        
        # 4. Stock Total y Sin Stock
        # Calculamos la suma de todos los stocks
        stock_total = db.query(func.sum(Producto.stock_actual)).filter(Producto.estado == True).scalar() or 0
        # Productos que tienen stock 0
        sin_stock = db.query(func.count(Producto.id)).filter(Producto.estado == True, Producto.stock_actual == 0).scalar() or 0

        return DashboardStatsResponse(
            ventas_hoy=ventas_hoy,
            compras_hoy=compras_hoy,
            perdidas_hoy=perdidas_hoy,
            total_productos=total_productos,
            total_marcas=total_marcas,
            stock_total=stock_total,
            sin_stock=sin_stock
        )

dashboard_service = DashboardService()
