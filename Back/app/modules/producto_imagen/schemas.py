from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.producto_imagen.constants import (
    MAX_BUCKET,
    MAX_NOMBRE_ARCHIVO,
    MAX_ORDEN,
    MAX_RUTA,
    MIN_ORDEN,
)


class ProductoImagenBase(BaseModel):

    producto_id: int = Field(
        ...,
        gt=0,
        description="ID del producto",
    )

    bucket: str = Field(
        ...,
        min_length=1,
        max_length=MAX_BUCKET,
        description="Bucket donde esta almacenada la imagen",
    )

    ruta: str = Field(
        ...,
        min_length=1,
        max_length=MAX_RUTA,
        description="Ruta de la imagen",
    )

    nombre_archivo: str | None = Field(
        default=None,
        max_length=MAX_NOMBRE_ARCHIVO,
        description="Nombre original del archivo",
    )

    es_principal: bool = Field(
        default=False,
        description="Indica si es la imagen principal del producto",
    )

    orden: int = Field(
        default=1,
        ge=MIN_ORDEN,
        le=MAX_ORDEN,
        description="Orden de visualizacion de la imagen",
    )


class ProductoImagenCreate(ProductoImagenBase):
    pass


class ProductoImagenUpdate(BaseModel):

    producto_id: int | None = Field(
        default=None,
        gt=0,
    )

    bucket: str | None = Field(
        default=None,
        min_length=1,
        max_length=MAX_BUCKET,
    )

    ruta: str | None = Field(
        default=None,
        min_length=1,
        max_length=MAX_RUTA,
    )

    nombre_archivo: str | None = Field(
        default=None,
        max_length=MAX_NOMBRE_ARCHIVO,
    )

    es_principal: bool | None = None

    orden: int | None = Field(
        default=None,
        ge=MIN_ORDEN,
        le=MAX_ORDEN,
    )


class ProductoImagenResponse(ProductoImagenBase):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    created_at: datetime


class ProductoImagenListResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    items: list[ProductoImagenResponse]

    total: int
