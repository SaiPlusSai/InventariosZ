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
    
    # Datos extendidos para el listado profesional
    codigo: Optional[str] = Field(None, description="Código del producto")
    producto_nombre: Optional[str] = Field(None, description="Descripción corta del producto")
    marca: Optional[str] = None
    tipo_calzado: Optional[str] = None
    material: Optional[str] = None
    color: Optional[str] = None
    talla: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class MovimientoFiltro(BaseModel):
    # Relacionales
    producto_id: Optional[int] = None
    codigo: Optional[str] = None
    marca: Optional[str] = None
    tipo_calzado: Optional[str] = None
    material: Optional[str] = None
    color: Optional[str] = None
    talla: Optional[str] = None
    
    # Propios
    tipo_movimiento: Optional[TipoMovimiento] = None
    origen: Optional[OrigenMovimiento] = None
    observacion: Optional[str] = None
    
    # Rangos
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    cantidad_min: Optional[int] = None
    cantidad_max: Optional[int] = None
    
    # Búsqueda global
    search: Optional[str] = None
    
    # Ordenamiento
    sort_by: Optional[str] = 'fecha'
    sort_order: Optional[str] = 'desc'

class MovimientoListadoResponse(BaseModel):
    items: List[MovimientoResponse]
    total: int
    page: int = 1
    limit: int = 50
    pages: int = 1
