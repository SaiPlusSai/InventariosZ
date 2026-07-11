from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MarcaBase(BaseModel):
    nombre: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Nombre de la marca"
    )

    descripcion: str | None = Field(
        default=None,
        max_length=500,
        description="Descripción de la marca"
    )


class MarcaCreate(MarcaBase):
    pass


class MarcaUpdate(BaseModel):
    nombre: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    descripcion: str | None = Field(
        default=None,
        max_length=500
    )

    estado: bool | None = None


class MarcaResponse(MarcaBase):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    estado: bool

    created_at: datetime

    updated_at: datetime


class MarcaListResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    items: list[MarcaResponse]

    total: int
class FilaPrevia(BaseModel):
    fila: int
    nombre: str | None
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
