from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.modules.movimiento_inventario.models import MovimientoInventario
from app.modules.movimiento_inventario.schemas import MovimientoCreate
from app.modules.movimiento_inventario.repository import movimiento_repository
from app.modules.movimiento_inventario.constants import TipoMovimiento
from app.modules.movimiento_inventario.validators import validar_coherencia_tipo_origen, validar_origen_observacion
from app.modules.movimiento_inventario.exceptions import StockInsuficienteException, MovimientoInvalidoException
from app.modules.producto.models import Producto

class MovimientoInventarioService:

    def registrar_movimiento(self, db: Session, request: MovimientoCreate) -> MovimientoInventario:
        """
        NÚCLEO DEL SISTEMA DE INVENTARIO:
        Registra un movimiento en el Kardex y actualiza el stock físico de manera atómica (Transaccional).
        Ningún otro módulo debe hacer UPDATE producto SET stock_actual = ...
        """
        # 1. Validaciones de Negocio Estáticas
        validar_coherencia_tipo_origen(request.tipo_movimiento, request.origen)
        validar_origen_observacion(request.origen, request.observacion)

        # 2. Bloquear la fila del producto (Evita Race Conditions)
        # Esto asegura que si dos usuarios venden el último par al mismo milisegundo, 
        # la BD serialice las operaciones.
        producto = db.query(Producto).filter(Producto.id == request.producto_id).with_for_update().first()
        
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        # 3. Leer stock actual
        stock_anterior = producto.stock_actual
        
        # 4. Calcular stock nuevo
        if request.tipo_movimiento == TipoMovimiento.ENTRADA:
            stock_nuevo = stock_anterior + request.cantidad
        elif request.tipo_movimiento == TipoMovimiento.SALIDA:
            if stock_anterior - request.cantidad < 0:
                raise StockInsuficienteException(stock_anterior, request.cantidad)
            stock_nuevo = stock_anterior - request.cantidad
        elif request.tipo_movimiento == TipoMovimiento.AJUSTE:
            # En un AJUSTE, usualmente cantidad puede ser + o -, pero según nuestro schema
            # ENTRADA o SALIDA ya definen la dirección. Si por alguna razón se usa AJUSTE,
            # lo modelaremos aquí asumiendo que es un reemplazo total o un delta absoluto.
            # Según diseño (Fase 1.5), los ajustes se ingresan como ENTRADA o SALIDA.
            # Protegemos este caso:
            raise MovimientoInvalidoException("Para ajustes manuales utilice ENTRADA (Sobrante) o SALIDA (Faltante).")
        else:
            raise MovimientoInvalidoException("Tipo de movimiento desconocido")

        # 5. Crear Movimiento (Kardex)
        movimiento = MovimientoInventario(
            producto_id=request.producto_id,
            tipo_movimiento=request.tipo_movimiento.value,
            origen=request.origen.value,
            cantidad=request.cantidad,
            stock_anterior=stock_anterior,
            stock_nuevo=stock_nuevo,
            documento_tipo=request.documento_tipo,
            documento_id=request.documento_id,
            usuario_id=request.usuario_id,
            observacion=request.observacion
        )
        
        movimiento_creado = movimiento_repository.create(db, movimiento)

        # 6. Actualizar Producto Físicamente
        producto.stock_actual = stock_nuevo
        db.add(producto)
        
        # db.commit() debe ser llamado por el Router o manejador de sesión global para mantener
        # la atomicidad, pero en caso de que este servicio se use de forma independiente, hacemos commit aquí si se requiere.
        # En la arquitectura estándar usualmente el Depends(get_db) maneja esto, pero para seguridad transaccional:
        db.commit()
        db.refresh(movimiento_creado)

        return movimiento_creado

    def obtener_kardex_producto(self, db: Session, producto_id: int, skip: int = 0, limit: int = 100):
        # Validar si el producto existe
        producto = db.query(Producto).filter(Producto.id == producto_id).first()
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
            
        movimientos = movimiento_repository.get_kardex_by_producto(db, producto_id, skip, limit)
        total = movimiento_repository.count_kardex_by_producto(db, producto_id)
        
        return {
            "total": total,
            "items": movimientos
        }

movimiento_service = MovimientoInventarioService()
