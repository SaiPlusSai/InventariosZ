from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class ProductoBase(BaseModel):

    codigo_producto_id: int = Field(
        ...,
        gt=0,
        description="ID del código del producto"
    )

    tipo_calzado_id: int = Field(
        ...,
        gt=0,
        description="ID del tipo de calzado"
    )

    material_id: int = Field(
        ...,
        gt=0,
        description="ID del material"
    )

    color_id: int = Field(
        ...,
        gt=0,
        description="ID del color"
    )

    talla_id: int = Field(
        ...,
        gt=0,
        description="ID de la talla"
    )

    descripcion: str | None = Field(
        default=None,
        max_length=500,
        description="Descripción del producto"
    )

    stock_actual: int = Field(
        default=0,
        ge=0
    )

    stock_minimo: int = Field(
        default=0,
        ge=0
    )

    stock_maximo: int | None = Field(
        default=None,
        ge=0
    )


class ProductoCreate(ProductoBase):
    force: bool = Field(default=False, description="Si es true, ignora la advertencia de código duplicado en otra marca")


class ProductoUpdate(BaseModel):

    codigo_producto_id: int | None = Field(default=None, gt=0)

    tipo_calzado_id: int | None = Field(default=None, gt=0)

    material_id: int | None = Field(default=None, gt=0)

    color_id: int | None = Field(default=None, gt=0)

    talla_id: int | None = Field(default=None, gt=0)

    descripcion: str | None = Field(
        default=None,
        max_length=500
    )

    stock_actual: int | None = Field(
        default=None,
        ge=0
    )

    stock_minimo: int | None = Field(
        default=None,
        ge=0
    )

    stock_maximo: int | None = Field(
        default=None,
        ge=0
    )

    estado: bool | None = None
    force: bool = Field(default=False, description="Si es true, ignora la advertencia de código duplicado en otra marca")


class ProductoResponse(ProductoBase):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    estado: bool

    created_at: datetime

    updated_at: datetime


class ProductoListResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    items: list[ProductoResponse]

    total: int
# ==========================================================
# VARIANTE
# ==========================================================

class VarianteCreate(BaseModel):

    color_id: int = Field(
        ...,
        gt=0,
        description="ID del color"
    )

    talla_id: int = Field(
        ...,
        gt=0,
        description="ID de la talla"
    )

    stock_actual: int = Field(
        default=0,
        ge=0,
    )

    stock_minimo: int = Field(
        default=0,
        ge=0,
    )

    stock_maximo: int | None = Field(
        default=None,
        ge=0,
    )

    precio_compra: Decimal | None = Field(
        default=None,
        ge=0,
    )

    precio_venta: Decimal = Field(
        ...,
        ge=0,
    )

    estado: bool = True


# ==========================================================
# IMAGEN
# ==========================================================

class ImagenProductoCreate(BaseModel):

    bucket: str = Field(
        ...,
        max_length=100,
    )

    ruta: str

    nombre_archivo: str | None = None

    es_principal: bool = False

    orden: int = 1


# ==========================================================
# PRODUCTO COMPLETO
# ==========================================================

class ProductoCompletoCreate(BaseModel):

    codigo: str = Field(
        ...,
        min_length=2,
        max_length=50,
    )

    marca_id: int = Field(
        ...,
        gt=0,
    )

    tipo_calzado_id: int = Field(
        ...,
        gt=0,
    )

    material_id: int = Field(
        ...,
        gt=0,
    )

    descripcion: str | None = Field(
        default=None,
        max_length=500,
    )

    variantes: list[VarianteCreate] = Field(
        ...,
        min_length=1,
    )
    
    force: bool = Field(default=False, description="Si es true, ignora la advertencia de código duplicado en otra marca")

    imagenes: list[ImagenProductoCreate] = Field(
        default_factory=list,
    )


# ==========================================================
# RESPUESTA
# ==========================================================

class ProductoCompletoResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True,
    )

    codigo_producto_id: int

    producto_principal_id: int | None = None

    variantes_creadas: int

    precios_creados: int

    imagenes_creadas: int

    success: bool

    message: str

    created_at: datetime
# ==========================================================
# RESPUESTA PARA EL LISTADO DE PRODUCTOS
# ==========================================================

class MarcaInfo(BaseModel):

    id: int
    nombre: str

    model_config = ConfigDict(
        from_attributes=True
    )


class TipoCalzadoInfo(BaseModel):

    id: int
    nombre: str

    model_config = ConfigDict(
        from_attributes=True
    )


class MaterialInfo(BaseModel):

    id: int
    nombre: str

    model_config = ConfigDict(
        from_attributes=True
    )


class ColorInfo(BaseModel):

    id: int

    nombre: str

    codigo_hex: str | None = None

    model_config = ConfigDict(
        from_attributes=True
    )


class TallaInfo(BaseModel):

    id: int
    nombre: str

    model_config = ConfigDict(
        from_attributes=True
    )


class ProductoListadoResponse(BaseModel):

    id: int
    
    codigo_producto_id: int

    codigo: str

    descripcion: str | None

    marca: MarcaInfo

    tipo_calzado: TipoCalzadoInfo

    material: MaterialInfo

    color: ColorInfo

    talla: TallaInfo

    stock_actual: int

    stock_minimo: int

    stock_maximo: int | None

    precio_compra: Decimal | None

    precio_venta: Decimal | None

    imagen_principal: str | None

    estado: bool

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
    # ==========================================================
# DETALLE DEL PRODUCTO
# ==========================================================

class PrecioDetalleResponse(BaseModel):

    precio_compra: Decimal | None

    precio_venta: Decimal

    model_config = ConfigDict(
        from_attributes=True
    )


class ImagenDetalleResponse(BaseModel):

    id: int

    bucket: str

    ruta: str

    nombre_archivo: str | None

    es_principal: bool

    orden: int

    model_config = ConfigDict(
        from_attributes=True
    )


class VarianteDetalleResponse(BaseModel):
    id: int
    color: ColorInfo
    talla: TallaInfo
    stock_actual: int
    stock_minimo: int
    stock_maximo: int | None
    precio: PrecioDetalleResponse | None = None
    estado: bool
    model_config = ConfigDict(from_attributes=True)

class ProductoDetalleResponse(BaseModel):

    id: int

    codigo: str

    descripcion: str | None

    marca: MarcaInfo

    tipo_calzado: TipoCalzadoInfo

    material: MaterialInfo

    color: ColorInfo

    talla: TallaInfo

    stock_actual: int

    stock_minimo: int

    stock_maximo: int | None

    precio: PrecioDetalleResponse | None = None

    imagen_principal: str | None

    imagenes: list[ImagenDetalleResponse]

    variantes: list[VarianteDetalleResponse] = Field(default_factory=list)

    estado: bool

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
class StockResponse(BaseModel):
    producto_id: int
    stock_actual: int
# ==========================================================
# EDITAR PRODUCTO COMPLETO
# ==========================================================

class VarianteUpdate(BaseModel):

    id: int | None = None

    color_id: int = Field(
        ...,
        gt=0,
    )

    talla_id: int = Field(
        ...,
        gt=0,
    )

    stock_actual: int = Field(
        default=0,
        ge=0,
    )

    stock_minimo: int = Field(
        default=0,
        ge=0,
    )

    stock_maximo: int | None = Field(
        default=None,
        ge=0,
    )

    precio_compra: Decimal | None = Field(
        default=None,
        ge=0,
    )

    precio_venta: Decimal = Field(
        ...,
        ge=0,
    )

    estado: bool = True


class ImagenProductoUpdate(BaseModel):

    id: int | None = None

    bucket: str

    ruta: str

    nombre_archivo: str | None = None

    es_principal: bool = False

    orden: int = 1


class ProductoCompletoUpdate(BaseModel):

    codigo: str = Field(
        ...,
        min_length=2,
        max_length=50,
    )

    marca_id: int = Field(
        ...,
        gt=0,
    )

    tipo_calzado_id: int = Field(
        ...,
        gt=0,
    )

    material_id: int = Field(
        ...,
        gt=0,
    )

    descripcion: str | None = Field(
        default=None,
        max_length=500,
    )

    variantes: list[VarianteUpdate]

    imagenes: list[ImagenProductoUpdate] = Field(
        default_factory=list,
    )
    
    force: bool = Field(default=False, description="Si es true, ignora la advertencia de código duplicado en otra marca")


# ==========================================================
# RESPUESTA GET EDITAR
# ==========================================================

class VarianteEditarResponse(BaseModel):

    id: int

    color_id: int

    talla_id: int

    stock_actual: int

    stock_minimo: int

    stock_maximo: int | None

    precio_compra: Decimal | None

    precio_venta: Decimal

    model_config = ConfigDict(
        from_attributes=True
    )


class ImagenEditarResponse(BaseModel):

    id: int

    bucket: str

    ruta: str

    nombre_archivo: str | None

    es_principal: bool

    orden: int

    model_config = ConfigDict(
        from_attributes=True
    )


class ProductoCompletoEditarResponse(BaseModel):

    codigo_producto_id: int

    codigo: str

    marca_id: int

    tipo_calzado_id: int

    material_id: int

    descripcion: str | None

    variantes: list[VarianteEditarResponse]

    imagenes: list[ImagenEditarResponse]

    model_config = ConfigDict(
        from_attributes=True
    )

# ==========================================================
# RESPUESTA PARA EL CATALOGO (NUEVO MODELO DE NEGOCIO)
# ==========================================================

class VarianteCatalogoResponse(BaseModel):
    id: int
    talla: TallaInfo
    stock_actual: int
    stock_minimo: int
    stock_maximo: int | None
    precio_compra: Decimal | None
    precio_venta: Decimal
    estado: bool

    model_config = ConfigDict(from_attributes=True)

class ColorCatalogoResponse(BaseModel):
    color_id: int
    color: ColorInfo
    imagen_principal: str | None
    variantes: list[VarianteCatalogoResponse]

    model_config = ConfigDict(from_attributes=True)

class ProductoCatalogoResponse(BaseModel):
    codigo_producto_id: int
    codigo: str
    marca: MarcaInfo
    tipo_calzado: TipoCalzadoInfo
    material: MaterialInfo
    descripcion: str | None
    colores: list[ColorCatalogoResponse]

    model_config = ConfigDict(from_attributes=True)


class VarianteColorUpdate(BaseModel):
    id: int | None = None
    talla_id: int
    stock_actual: int = 0
    stock_minimo: int = 0
    stock_maximo: int | None = None
    precio_compra: Decimal | None = None
    precio_venta: Decimal
    estado: bool = True

class ImagenColorUpdate(BaseModel):
    id: int | None = None
    es_principal: bool
    orden: int

class ProductoColorUpdate(BaseModel):
    codigo: str = Field(..., max_length=50)
    marca_id: int
    tipo_calzado_id: int
    material_id: int
    descripcion: str | None = None
    variantes: list[VarianteColorUpdate]
    imagenes: list[ImagenColorUpdate] = []

class FilaPrevia(BaseModel):
    fila: int
    codigo: str | None
    marca: str | None
    tipo: str | None
    material: str | None
    color: str | None
    talla: str | None
    stock: str | None
    precio: str | None
    descripcion: str | None
    valido: bool
    errores: list[str]

class PreviaImportacionResponse(BaseModel):
    total: int
    validos: int
    errores: int
    filas: list[FilaPrevia]

class ConfirmarImportacionRequest(BaseModel):
    filas: list[FilaPrevia]
