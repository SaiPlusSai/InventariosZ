from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from app.modules.movimiento_inventario.constants import TipoMovimiento, OrigenMovimiento

class MovimientoBase(BaseModel):
    producto_id: int
    tipo_movimiento: TipoMovimiento
    origen: OrigenMovimiento
    cantidad: int = Field(gt=0, description="Cantidad a mover, debe ser mayor a 0")
    documento_tipo: Optional[str] = None
    documento_id: Optional[int] = None
    usuario_id: Optional[int] = None
    observacion: Optional[str] = None

class MovimientoCreate(MovimientoBase):
    pass

class MovimientoResponse(MovimientoBase):
    id: int
    stock_anterior: int
    stock_nuevo: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MovimientoFiltro(BaseModel):
    producto_id: Optional[int] = None
    tipo_movimiento: Optional[TipoMovimiento] = None
    origen: Optional[OrigenMovimiento] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
