from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CodigoProductoBase(BaseModel):
    marca_id: int = Field(
        ...,
        gt=0,
        description="ID de la marca"
    )

    codigo: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Código del producto"
    )


class CodigoProductoCreate(CodigoProductoBase):
    force: bool = Field(default=False, description="Si es true, ignora la advertencia de código duplicado en otra marca")


class CodigoProductoUpdate(BaseModel):
    marca_id: int | None = Field(
        default=None,
        gt=0
    )

    codigo: str | None = Field(
        default=None,
        min_length=2,
        max_length=50
    )

    estado: bool | None = None
    force: bool = Field(default=False, description="Si es true, ignora la advertencia de código duplicado en otra marca")


class CodigoProductoResponse(CodigoProductoBase):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    estado: bool
    created_at: datetime
    updated_at: datetime


class CodigoProductoListResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    items: list[CodigoProductoResponse]

    total: int

class FilaPrevia(BaseModel):
    fila: int
    marca: str | None
    codigo: str | None
    valido: bool
    errores: list[str]

class PreviaImportacionResponse(BaseModel):
    total: int
    validos: int
    errores: int
    filas: list[FilaPrevia]

class ConfirmarImportacionRequest(BaseModel):
    filas: list[FilaPrevia]