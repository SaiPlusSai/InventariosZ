from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MaterialBase(BaseModel):
    nombre: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Nombre del material",
    )

    descripcion: str | None = Field(
        default=None,
        max_length=500,
        description="Descripcion del material",
    )


class MaterialCreate(MaterialBase):
    pass


class MaterialUpdate(BaseModel):
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


class MaterialResponse(MaterialBase):

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    estado: bool

    created_at: datetime

    updated_at: datetime


class MaterialListResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True,
    )

    items: list[MaterialResponse]

    total: int
