from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.precio_producto.models import PrecioProducto


class PrecioProductoRepository:
    """
    Repositorio encargado exclusivamente del acceso
    a la base de datos.
    """

    def get_all(
        self,
        db: Session,
    ) -> list[PrecioProducto]:

        statement = (
            select(PrecioProducto)
            .order_by(PrecioProducto.created_at.desc())
        )

        return db.scalars(statement).all()

    def get_by_id(
        self,
        db: Session,
        precio_producto_id: int,
    ) -> PrecioProducto | None:

        statement = (
            select(PrecioProducto)
            .where(PrecioProducto.id == precio_producto_id)
        )

        return db.scalar(statement)

    def get_by_producto_id(
        self,
        db: Session,
        producto_id: int,
    ) -> list[PrecioProducto]:

        statement = (
            select(PrecioProducto)
            .where(PrecioProducto.producto_id == producto_id)
            .order_by(PrecioProducto.vigente_desde.desc())
        )

        return db.scalars(statement).all()

    def create(
        self,
        db: Session,
        precio_producto: PrecioProducto,
    ) -> PrecioProducto:

        db.add(precio_producto)
        db.commit()
        db.refresh(precio_producto)

        return precio_producto

    def update(
        self,
        db: Session,
        precio_producto: PrecioProducto,
    ) -> PrecioProducto:

        db.commit()
        db.refresh(precio_producto)

        return precio_producto

    def delete(
        self,
        db: Session,
        precio_producto: PrecioProducto,
    ) -> None:

        db.delete(precio_producto)
        db.commit()
