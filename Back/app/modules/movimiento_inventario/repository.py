from sqlalchemy.orm import Session, joinedload
from app.modules.movimiento_inventario.models import MovimientoInventario
from app.modules.producto.models import Producto
from app.modules.codigo_producto.models import CodigoProducto

class MovimientoInventarioRepository:
    def create(self, db: Session, obj_in: MovimientoInventario) -> MovimientoInventario:
        db.add(obj_in)
        db.flush() # Importante usar flush en vez de commit para mantener la transacción abierta en el service
        return obj_in

    def get_kardex_by_producto(self, db: Session, producto_id: int, skip: int = 0, limit: int = 100):
        return db.query(MovimientoInventario)\
            .filter(MovimientoInventario.producto_id == producto_id)\
            .order_by(MovimientoInventario.created_at.desc())\
            .offset(skip).limit(limit).all()

    def listar_movimientos(self, db: Session, skip: int = 0, limit: int = 50) -> list[MovimientoInventario]:
        """
        Obtiene la lista de todos los movimientos con carga adelantada optimizada (Eager Loading).
        Preparado para soportar filtros futuros.
        """
        query = db.query(MovimientoInventario).options(
            joinedload(MovimientoInventario.producto).joinedload(Producto.codigo_producto).joinedload(CodigoProducto.marca),
            joinedload(MovimientoInventario.producto).joinedload(Producto.tipo_calzado),
            joinedload(MovimientoInventario.producto).joinedload(Producto.material),
            joinedload(MovimientoInventario.producto).joinedload(Producto.color),
            joinedload(MovimientoInventario.producto).joinedload(Producto.talla)
        )
        
        # Filtros futuros irán aquí (ej: if filtros.producto_id: query = query.filter(...))
        
        return query.order_by(MovimientoInventario.created_at.desc()).offset(skip).limit(limit).all()

    def contar_movimientos_total(self, db: Session) -> int:
        """
        Obtiene el total de movimientos en la tabla. Preparado para aplicar filtros.
        """
        query = db.query(MovimientoInventario)
        # Filtros futuros irán aquí
        return query.count()

    def count_kardex_by_producto(self, db: Session, producto_id: int) -> int:
        return db.query(MovimientoInventario).filter(MovimientoInventario.producto_id == producto_id).count()

movimiento_repository = MovimientoInventarioRepository()
