from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.codigo_producto.models import CodigoProducto


class CodigoProductoRepository:
    """
    Repositorio encargado exclusivamente del acceso
    a la base de datos.
    """

    def get_all(
        self,
        db: Session,
    ) -> list[CodigoProducto]:

        statement = (
            select(CodigoProducto)
            .order_by(CodigoProducto.codigo.asc())
        )

        return db.scalars(statement).all()

    def get_by_id(
        self,
        db: Session,
        codigo_producto_id: int,
    ) -> CodigoProducto | None:

        statement = (
            select(CodigoProducto)
            .where(CodigoProducto.id == codigo_producto_id)
        )

        return db.scalar(statement)

    def get_by_codigo(
        self,
        db: Session,
        codigo: str,
    ) -> CodigoProducto | None:

        statement = (
            select(CodigoProducto)
            .where(CodigoProducto.codigo == codigo)
        )

        return db.scalar(statement)

    def get_by_marca(
        self,
        db: Session,
        marca_id: int,
    ) -> list[CodigoProducto]:

        statement = (
            select(CodigoProducto)
            .where(CodigoProducto.marca_id == marca_id)
            .order_by(CodigoProducto.codigo.asc())
        )

        return db.scalars(statement).all()

    def create(
        self,
        db: Session,
        codigo_producto: CodigoProducto,
    ) -> CodigoProducto:

        db.add(codigo_producto)
        db.commit()
        db.refresh(codigo_producto)

        return codigo_producto

    def update(
        self,
        db: Session,
        codigo_producto: CodigoProducto,
    ) -> CodigoProducto:

        db.commit()
        db.refresh(codigo_producto)

        return codigo_producto

    def delete(
        self,
        db: Session,
        codigo_producto: CodigoProducto,
    ) -> None:

        db.delete(codigo_producto)
        db.commit()