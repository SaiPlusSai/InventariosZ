from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.color.constants import PATRON_CODIGO_HEX


class ColorBase(BaseModel):
    nombre: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Nombre del color",
    )

    codigo_hex: str | None = Field(
        default=None,
        min_length=7,
        max_length=7,
        pattern=PATRON_CODIGO_HEX,
        description="Codigo hexadecimal del color",
    )


class ColorCreate(ColorBase):
    pass


class ColorUpdate(BaseModel):
    nombre: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    codigo_hex: str | None = Field(
        default=None,
        min_length=7,
        max_length=7,
        pattern=PATRON_CODIGO_HEX,
    )

    estado: bool | None = None


class ColorResponse(ColorBase):

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    estado: bool

    created_at: datetime

    updated_at: datetime


class ColorListResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True,
    )

    items: list[ColorResponse]

    total: int

class FilaPrevia(BaseModel):
    fila: int
    nombre: str | None
    descripcion: str | None
    codigo_hex: str | None = None
    valido: bool
    errores: list[str]

class PreviaImportacionResponse(BaseModel):
    total: int
    validos: int
    errores: int
    filas: list[FilaPrevia]

class ConfirmarImportacionRequest(BaseModel):
    filas: list[FilaPrevia]
