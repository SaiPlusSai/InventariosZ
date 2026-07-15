from sqlalchemy import Column, Integer, String, BigInteger, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.base import Base
from app.modules.movimiento_inventario.constants import TipoMovimiento, OrigenMovimiento

class MovimientoInventario(Base):
    __tablename__ = "movimiento_inventario"
    __table_args__ = (
        CheckConstraint("tipo_movimiento IN ('ENTRADA', 'SALIDA', 'AJUSTE')", name="movimiento_inventario_tipo_movimiento_check"),
        CheckConstraint("origen IN ('COMPRA', 'COMPRA_CANCELADA', 'VENTA', 'VENTA_CANCELADA', 'DEVOLUCION_CLIENTE', 'DEVOLUCION_PROVEEDOR', 'AJUSTE_MANUAL', 'AJUSTE_INVENTARIO', 'INVENTARIO_INICIAL', 'CORRECCION', 'TRANSFERENCIA_ENTRADA', 'TRANSFERENCIA_SALIDA', 'MERMA_DANO', 'MERMA_ROBO', 'MERMA_PERDIDA', 'IMPORTACION', 'RESERVA', 'LIBERACION_RESERVA', 'DONACION', 'MUESTRA', 'OTRO', 'INTERCAMBIO')", name="movimiento_inventario_origen_check"),
        CheckConstraint("cantidad > 0", name="movimiento_inventario_cantidad_check"),
        CheckConstraint("stock_anterior >= 0", name="movimiento_inventario_stock_anterior_check"),
        CheckConstraint("stock_nuevo >= 0", name="movimiento_inventario_stock_nuevo_check"),
        {"schema": "inventario"}
    )

    id = Column(BigInteger, primary_key=True, index=True)
    producto_id = Column(BigInteger, ForeignKey("inventario.producto.id"), nullable=False)
    tipo_movimiento = Column(String(20), nullable=False)
    origen = Column(String(40), nullable=False)
    cantidad = Column(Integer, nullable=False)
    stock_anterior = Column(Integer, nullable=False)
    stock_nuevo = Column(Integer, nullable=False)
    documento_tipo = Column(String(30), nullable=True)
    documento_id = Column(BigInteger, nullable=True)
    usuario_id = Column(BigInteger, nullable=True)
    observacion = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relaciones
    producto = relationship("Producto", back_populates="movimientos")
