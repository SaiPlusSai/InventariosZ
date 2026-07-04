from datetime import datetime

from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import DateTime
from sqlalchemy import String
from sqlalchemy import func
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from app.core.base import Base


class Color(Base):
    """
    Modelo de la tabla inventario.color.
    """

    __tablename__ = "color"
    __table_args__ = {"schema": "inventario"}

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    nombre: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    codigo_hex: Mapped[str | None] = mapped_column(
        String(7),
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

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
