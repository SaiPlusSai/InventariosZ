from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Numeric
from sqlalchemy import func
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from app.core.base import Base
from app.modules.producto.models import Producto


class PrecioProducto(Base):
    """
    Modelo de la tabla inventario.precio_producto.
    """

    __tablename__ = "precio_producto"
    __table_args__ = {"schema": "inventario"}

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    producto_id: Mapped[int] = mapped_column(
        ForeignKey("inventario.producto.id"),
        nullable=False,
    )

    precio_compra: Mapped[Decimal | None] = mapped_column(
        Numeric,
        nullable=True,
    )

    precio_venta: Mapped[Decimal] = mapped_column(
        Numeric,
        nullable=False,
    )

    vigente_desde: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    vigente_hasta: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    estado: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    producto: Mapped[Producto] = relationship(
        "Producto",
        back_populates="precios",
        lazy="joined",
    )
