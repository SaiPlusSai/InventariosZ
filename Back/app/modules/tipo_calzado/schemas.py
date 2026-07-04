from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TipoCalzadoBase(BaseModel):
    nombre: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Nombre del tipo de calzado",
    )

    descripcion: str | None = Field(
        default=None,
        max_length=500,
        description="Descripcion del tipo de calzado",
    )


class TipoCalzadoCreate(TipoCalzadoBase):
    pass


class TipoCalzadoUpdate(BaseModel):
    nombre: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    descripcion: str | None = Field(
        default=None,
        max_length=500,
    )

    estado: bool | None = None


class TipoCalzadoResponse(TipoCalzadoBase):

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    estado: bool

    created_at: datetime

    updated_at: datetime


class TipoCalzadoListResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True,
    )

    items: list[TipoCalzadoResponse]

    total: int
