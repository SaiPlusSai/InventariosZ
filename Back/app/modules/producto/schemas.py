from datetime import datetime

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
    pass


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