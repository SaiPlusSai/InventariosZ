from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.producto.models import Producto


class ProductoRepository:
    """
    Repositorio encargado exclusivamente del acceso
    a la base de datos.
    """

    def get_all(
        self,
        db: Session,
    ) -> list[Producto]:

        statement = (
            select(Producto)
            .order_by(Producto.id.desc())
        )

        return db.scalars(statement).all()

    def get_by_id(
        self,
        db: Session,
        producto_id: int,
    ) -> Producto | None:

        statement = (
            select(Producto)
            .where(Producto.id == producto_id)
        )

        return db.scalar(statement)

    def create(
        self,
        db: Session,
        producto: Producto,
    ) -> Producto:

        db.add(producto)
        db.commit()
        db.refresh(producto)

        return producto

    def update(
        self,
        db: Session,
        producto: Producto,
    ) -> Producto:

        db.commit()
        db.refresh(producto)

        return producto

    def delete(
        self,
        db: Session,
        producto: Producto,
    ) -> None:

        db.delete(producto)
        db.commit()

    def exists(
        self,
        db: Session,
        codigo_producto_id: int,
        color_id: int,
        talla_id: int,
    ) -> Producto | None:
        """
        Evita registrar dos veces
        la misma combinación:
        Código + Color + Talla
        """

        statement = (
            select(Producto)
            .where(
                Producto.codigo_producto_id == codigo_producto_id,
                Producto.color_id == color_id,
                Producto.talla_id == talla_id,
            )
        )

        return db.scalar(statement)