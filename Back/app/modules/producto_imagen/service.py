from sqlalchemy.orm import Session

from app.modules.producto.constants import PRODUCTO_NO_EXISTE
from app.modules.producto.exceptions import ProductoNoEncontradoException
from app.modules.producto.repository import ProductoRepository
from app.modules.producto_imagen.constants import PRODUCTO_IMAGEN_NO_EXISTE
from app.modules.producto_imagen.exceptions import (
    ProductoImagenNoEncontradaException,
)
from app.modules.producto_imagen.models import ProductoImagen
from app.modules.producto_imagen.repository import ProductoImagenRepository
from app.modules.producto_imagen.schemas import (
    ProductoImagenCreate,
    ProductoImagenUpdate,
)


class ProductoImagenService:

    def __init__(self):
        self.repository = ProductoImagenRepository()
        self.producto_repository = ProductoRepository()

    def get_all(
        self,
        db: Session,
    ) -> list[ProductoImagen]:

        return self.repository.get_all(db)

    def get_by_id(
        self,
        db: Session,
        producto_imagen_id: int,
    ) -> ProductoImagen | None:

        return self.repository.get_by_id(
            db,
            producto_imagen_id,
        )

    def get_by_producto_id(
        self,
        db: Session,
        producto_id: int,
    ) -> list[ProductoImagen]:

        if not self.producto_repository.get_by_id(db, producto_id):
            raise ProductoNoEncontradoException(
                PRODUCTO_NO_EXISTE
            )

        return self.repository.get_by_producto_id(
            db,
            producto_id,
        )

    def create(
        self,
        db: Session,
        data: ProductoImagenCreate,
    ) -> ProductoImagen:

        if not self.producto_repository.get_by_id(db, data.producto_id):
            raise ProductoNoEncontradoException(
                PRODUCTO_NO_EXISTE
            )

        if data.es_principal:
            self.repository.unset_principal_by_producto(
                db,
                data.producto_id,
            )

        producto_imagen = ProductoImagen(
            **data.model_dump()
        )

        return self.repository.create(
            db,
            producto_imagen,
        )

    def update(
        self,
        db: Session,
        producto_imagen_id: int,
        data: ProductoImagenUpdate,
    ) -> ProductoImagen:

        producto_imagen = self.repository.get_by_id(
            db,
            producto_imagen_id,
        )

        if not producto_imagen:
            raise ProductoImagenNoEncontradaException(
                PRODUCTO_IMAGEN_NO_EXISTE
            )

        if data.producto_id is not None:
            if not self.producto_repository.get_by_id(db, data.producto_id):
                raise ProductoNoEncontradoException(
                    PRODUCTO_NO_EXISTE
                )

            producto_imagen.producto_id = data.producto_id

        if data.bucket is not None:
            producto_imagen.bucket = data.bucket

        if data.ruta is not None:
            producto_imagen.ruta = data.ruta

        if "nombre_archivo" in data.model_fields_set:
            producto_imagen.nombre_archivo = data.nombre_archivo

        if data.es_principal is not None:
            producto_imagen.es_principal = data.es_principal

        if data.orden is not None:
            producto_imagen.orden = data.orden

        if producto_imagen.es_principal:
            self.repository.unset_principal_by_producto(
                db,
                producto_imagen.producto_id,
                exclude_id=producto_imagen.id,
            )

        return self.repository.update(
            db,
            producto_imagen,
        )

    def delete(
        self,
        db: Session,
        producto_imagen_id: int,
    ) -> None:

        producto_imagen = self.repository.get_by_id(
            db,
            producto_imagen_id,
        )

        if not producto_imagen:
            raise ProductoImagenNoEncontradaException(
                PRODUCTO_IMAGEN_NO_EXISTE
            )

        self.repository.delete(
            db,
            producto_imagen,
        )
