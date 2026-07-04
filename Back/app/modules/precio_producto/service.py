from sqlalchemy.orm import Session

from app.modules.precio_producto.constants import PRECIO_PRODUCTO_NO_EXISTE
from app.modules.precio_producto.exceptions import (
    PrecioProductoNoEncontradoException,
)
from app.modules.precio_producto.models import PrecioProducto
from app.modules.precio_producto.repository import PrecioProductoRepository
from app.modules.precio_producto.schemas import (
    PrecioProductoCreate,
    PrecioProductoUpdate,
)
from app.modules.producto.constants import PRODUCTO_NO_EXISTE
from app.modules.producto.exceptions import ProductoNoEncontradoException
from app.modules.producto.repository import ProductoRepository


class PrecioProductoService:

    def __init__(self):
        self.repository = PrecioProductoRepository()
        self.producto_repository = ProductoRepository()

    def get_all(
        self,
        db: Session,
    ) -> list[PrecioProducto]:

        return self.repository.get_all(db)

    def get_by_id(
        self,
        db: Session,
        precio_producto_id: int,
    ) -> PrecioProducto | None:

        return self.repository.get_by_id(
            db,
            precio_producto_id,
        )

    def get_by_producto_id(
        self,
        db: Session,
        producto_id: int,
    ) -> list[PrecioProducto]:

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
        data: PrecioProductoCreate,
    ) -> PrecioProducto:

        if not self.producto_repository.get_by_id(db, data.producto_id):
            raise ProductoNoEncontradoException(
                PRODUCTO_NO_EXISTE
            )

        precio_producto = PrecioProducto(
            **data.model_dump(exclude_none=True)
        )

        return self.repository.create(
            db,
            precio_producto,
        )

    def update(
        self,
        db: Session,
        precio_producto_id: int,
        data: PrecioProductoUpdate,
    ) -> PrecioProducto:

        precio_producto = self.repository.get_by_id(
            db,
            precio_producto_id,
        )

        if not precio_producto:
            raise PrecioProductoNoEncontradoException(
                PRECIO_PRODUCTO_NO_EXISTE
            )

        if data.producto_id is not None:
            if not self.producto_repository.get_by_id(db, data.producto_id):
                raise ProductoNoEncontradoException(
                    PRODUCTO_NO_EXISTE
                )

            precio_producto.producto_id = data.producto_id

        if "precio_compra" in data.model_fields_set:
            precio_producto.precio_compra = data.precio_compra

        if data.precio_venta is not None:
            precio_producto.precio_venta = data.precio_venta

        if data.vigente_desde is not None:
            precio_producto.vigente_desde = data.vigente_desde

        if "vigente_hasta" in data.model_fields_set:
            precio_producto.vigente_hasta = data.vigente_hasta

        if data.estado is not None:
            precio_producto.estado = data.estado

        return self.repository.update(
            db,
            precio_producto,
        )

    def delete(
        self,
        db: Session,
        precio_producto_id: int,
    ) -> None:

        precio_producto = self.repository.get_by_id(
            db,
            precio_producto_id,
        )

        if not precio_producto:
            raise PrecioProductoNoEncontradoException(
                PRECIO_PRODUCTO_NO_EXISTE
            )

        self.repository.delete(
            db,
            precio_producto,
        )
