from typing import Optional
from app.modules.movimiento_inventario.constants import TipoMovimiento, OrigenMovimiento
from app.modules.movimiento_inventario.exceptions import MovimientoInvalidoException

def validar_origen_observacion(origen: OrigenMovimiento, observacion: Optional[str]):
    """Valida que los ajustes y mermas tengan observacion obligatoria"""
    origenes_obligatorios = [
        OrigenMovimiento.AJUSTE_MANUAL,
        OrigenMovimiento.MERMA_DANO,
        OrigenMovimiento.MERMA_ROBO,
        OrigenMovimiento.MERMA_PERDIDA,
        OrigenMovimiento.DEVOLUCION_CLIENTE,
        OrigenMovimiento.DEVOLUCION_PROVEEDOR
    ]
    
    if origen in origenes_obligatorios:
        if not observacion or len(observacion.strip()) < 10:
            raise MovimientoInvalidoException("Debe proporcionar una justificación u observación válida (mínimo 10 caracteres) para este tipo de movimiento.")

def validar_coherencia_tipo_origen(tipo: TipoMovimiento, origen: OrigenMovimiento):
    """Valida que un origen no pertenezca a un tipo de movimiento incompatible"""
    if origen in [OrigenMovimiento.VENTA, OrigenMovimiento.MERMA_DANO, OrigenMovimiento.MERMA_PERDIDA, OrigenMovimiento.MERMA_ROBO]:
        if tipo != TipoMovimiento.SALIDA:
            raise MovimientoInvalidoException(f"El origen {origen.value} solo puede ser una SALIDA.")
            
    if origen in [OrigenMovimiento.COMPRA, OrigenMovimiento.INVENTARIO_INICIAL, OrigenMovimiento.IMPORTACION]:
        if tipo != TipoMovimiento.ENTRADA:
            raise MovimientoInvalidoException(f"El origen {origen.value} solo puede ser una ENTRADA.")
