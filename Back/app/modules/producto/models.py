from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import Text
from sqlalchemy import func
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from app.core.base import Base

from app.modules.codigo_producto.models import CodigoProducto
from app.modules.tipo_calzado.models import TipoCalzado
from app.modules.material.models import Material
from app.modules.color.models import Color
from app.modules.talla.models import Talla


class Producto(Base):
    """
    Modelo de la tabla inventario.producto.
    """

    __tablename__ = "producto"
    __table_args__ = {"schema": "inventario"}

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    codigo_producto_id: Mapped[int] = mapped_column(
        ForeignKey("inventario.codigo_producto.id"),
        nullable=False,
    )

    tipo_calzado_id: Mapped[int] = mapped_column(
        ForeignKey("inventario.tipo_calzado.id"),
        nullable=False,
    )

    material_id: Mapped[int] = mapped_column(
        ForeignKey("inventario.material.id"),
        nullable=False,
    )

    color_id: Mapped[int] = mapped_column(
        ForeignKey("inventario.color.id"),
        nullable=False,
    )

    talla_id: Mapped[int] = mapped_column(
        ForeignKey("inventario.talla.id"),
        nullable=False,
    )

    descripcion: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    stock_actual: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    stock_minimo: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    stock_maximo: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    estado: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ==========================================================
    # RELACIONES
    # ==========================================================

    codigo_producto: Mapped[CodigoProducto] = relationship(
        "CodigoProducto",
        lazy="joined",
    )

    tipo_calzado: Mapped[TipoCalzado] = relationship(
        "TipoCalzado",
        lazy="joined",
    )

    material: Mapped[Material] = relationship(
        "Material",
        lazy="joined",
    )

    color: Mapped[Color] = relationship(
        "Color",
        lazy="joined",
    )

    talla: Mapped[Talla] = relationship(
        "Talla",
        lazy="joined",
    )

    # ==========================================================
    # NUEVAS RELACIONES
    # ==========================================================

    precios: Mapped[list["PrecioProducto"]] = relationship(
        "PrecioProducto",
        back_populates="producto",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    imagenes: Mapped[list["ProductoImagen"]] = relationship(
        "ProductoImagen",
        back_populates="producto",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
