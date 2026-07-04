from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PrecioProductoBase(BaseModel):

    producto_id: int = Field(
        ...,
        gt=0,
        description="ID del producto",
    )

    precio_compra: Decimal | None = Field(
        default=None,
        ge=0,
        description="Precio de compra del producto",
    )

    precio_venta: Decimal = Field(
        ...,
        ge=0,
        description="Precio de venta del producto",
    )

    vigente_desde: datetime | None = Field(
        default=None,
        description="Fecha desde la que el precio esta vigente",
    )

    vigente_hasta: datetime | None = Field(
        default=None,
        description="Fecha hasta la que el precio esta vigente",
    )


class PrecioProductoCreate(PrecioProductoBase):
    pass


class PrecioProductoUpdate(BaseModel):

    producto_id: int | None = Field(
        default=None,
        gt=0,
    )

    precio_compra: Decimal | None = Field(
        default=None,
        ge=0,
    )

    precio_venta: Decimal | None = Field(
        default=None,
        ge=0,
    )

    vigente_desde: datetime | None = None

    vigente_hasta: datetime | None = None

    estado: bool | None = None


class PrecioProductoResponse(PrecioProductoBase):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    vigente_desde: datetime

    estado: bool

    created_at: datetime


class PrecioProductoListResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    items: list[PrecioProductoResponse]

    total: int
