from datetime import datetime

from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import SmallInteger
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import func
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from app.core.base import Base

from app.modules.producto.models import Producto


class ProductoImagen(Base):
    """
    Modelo de la tabla inventario.producto_imagen.
    """

    __tablename__ = "producto_imagen"
    __table_args__ = {"schema": "inventario"}

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    producto_id: Mapped[int] = mapped_column(
        ForeignKey("inventario.producto.id"),
        nullable=False,
    )

    bucket: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    ruta: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    nombre_archivo: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    es_principal: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="false",
    )

    orden: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        server_default="1",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    producto: Mapped[Producto] = relationship(
        "Producto",
        lazy="joined",
    )
