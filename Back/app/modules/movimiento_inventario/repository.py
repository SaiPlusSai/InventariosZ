from sqlalchemy.orm import Session
from app.modules.movimiento_inventario.models import MovimientoInventario

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

    def count_kardex_by_producto(self, db: Session, producto_id: int) -> int:
        return db.query(MovimientoInventario).filter(MovimientoInventario.producto_id == producto_id).count()

movimiento_repository = MovimientoInventarioRepository()
