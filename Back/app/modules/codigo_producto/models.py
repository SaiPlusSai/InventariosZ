from datetime import datetime

from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import String
from sqlalchemy import func
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from app.core.base import Base
from app.modules.marca.models import Marca


class CodigoProducto(Base):
    """
    Modelo de la tabla inventario.codigo_producto.
    """

    __tablename__ = "codigo_producto"
    __table_args__ = {"schema": "inventario"}

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    marca_id: Mapped[int] = mapped_column(
        ForeignKey("inventario.marca.id"),
        nullable=False,
    )

    codigo: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
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

    marca: Mapped[Marca] = relationship(
        "Marca",
        lazy="joined",
    )