from sqlalchemy import select
from sqlalchemy import update
from sqlalchemy.orm import Session

from app.modules.producto_imagen.models import ProductoImagen


class ProductoImagenRepository:
    """
    Repositorio encargado exclusivamente del acceso
    a la base de datos.
    """

    def get_all(
        self,
        db: Session,
    ) -> list[ProductoImagen]:

        statement = (
            select(ProductoImagen)
            .order_by(
                ProductoImagen.producto_id.asc(),
                ProductoImagen.orden.asc(),
                ProductoImagen.id.asc(),
            )
        )

        return db.scalars(statement).all()

    def get_by_id(
        self,
        db: Session,
        producto_imagen_id: int,
    ) -> ProductoImagen | None:

        statement = (
            select(ProductoImagen)
            .where(ProductoImagen.id == producto_imagen_id)
        )

        return db.scalar(statement)

    def get_by_producto_id(
        self,
        db: Session,
        producto_id: int,
    ) -> list[ProductoImagen]:

        statement = (
            select(ProductoImagen)
            .where(ProductoImagen.producto_id == producto_id)
            .order_by(
                ProductoImagen.orden.asc(),
                ProductoImagen.id.asc(),
            )
        )

        return db.scalars(statement).all()

    def unset_principal_by_producto(
        self,
        db: Session,
        producto_id: int,
        exclude_id: int | None = None,
    ) -> None:

        statement = (
            update(ProductoImagen)
            .where(ProductoImagen.producto_id == producto_id)
            .values(es_principal=False)
        )

        if exclude_id is not None:
            statement = statement.where(ProductoImagen.id != exclude_id)

        db.execute(statement)

    def create(
        self,
        db: Session,
        producto_imagen: ProductoImagen,
    ) -> ProductoImagen:

        db.add(producto_imagen)
        db.commit()
        db.refresh(producto_imagen)

        return producto_imagen

    def update(
        self,
        db: Session,
        producto_imagen: ProductoImagen,
    ) -> ProductoImagen:

        db.commit()
        db.refresh(producto_imagen)

        return producto_imagen

    def delete(
        self,
        db: Session,
        producto_imagen: ProductoImagen,
    ) -> None:

        db.delete(producto_imagen)
        db.commit()
