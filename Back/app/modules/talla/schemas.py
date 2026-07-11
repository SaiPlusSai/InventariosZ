from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.talla.constants import MAX_ORDEN
from app.modules.talla.constants import MIN_ORDEN


class TallaBase(BaseModel):
    nombre: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Nombre de la talla",
    )

    orden: int | None = Field(
        default=None,
        ge=MIN_ORDEN,
        le=MAX_ORDEN,
        description="Orden de la talla",
    )


class TallaCreate(TallaBase):
    pass


class TallaUpdate(BaseModel):
    nombre: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    orden: int | None = Field(
        default=None,
        ge=MIN_ORDEN,
        le=MAX_ORDEN,
    )

    estado: bool | None = None


class TallaResponse(TallaBase):

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    estado: bool

    created_at: datetime

    updated_at: datetime


class TallaListResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True,
    )

    items: list[TallaResponse]

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
