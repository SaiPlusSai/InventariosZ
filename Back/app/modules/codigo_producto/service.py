from app.core.exceptions import RegistroActivoNoPuedeEliminarseException
from sqlalchemy.orm import Session

from app.modules.codigo_producto.constants import (
    CODIGO_PRODUCTO_NO_EXISTE,
    CODIGO_PRODUCTO_YA_EXISTE,
)

from app.modules.codigo_producto.exceptions import (
    CodigoProductoNoEncontradoException,
    CodigoProductoYaExisteException,
)

from app.modules.codigo_producto.models import CodigoProducto
from app.modules.codigo_producto.repository import CodigoProductoRepository
from app.modules.codigo_producto.schemas import (
    CodigoProductoCreate,
    CodigoProductoUpdate,
)

from app.modules.marca.constants import MARCA_NO_EXISTE
from app.modules.marca.exceptions import MarcaNoEncontradaException
from app.modules.marca.repository import MarcaRepository


class CodigoProductoService:

    def __init__(self):
        self.repository = CodigoProductoRepository()
        self.marca_repository = MarcaRepository()

    
    def get_papelera(self, db: Session) -> list[CodigoProducto]:
        return self.repository.get_papelera(db)

    def get_dependencias(self, db: Session, id: int) -> dict:
        return self.repository.get_dependencias(db, id)

    def desactivar(self, db: Session, id: int):
        item = self.repository.get_by_id(db, id)
        if item:
            item.estado = False
            from sqlalchemy import func
            item.deleted_at = func.now()
            db.commit()
        return item

    def recuperar(self, db: Session, id: int):
        item = self.repository.get_by_id(db, id)
        if item:
            item.estado = True
            item.deleted_at = None
            db.commit()
        return item

    def get_all(
        self,
        db: Session,
    ) -> list[CodigoProducto]:

        return self.repository.get_all(db)

    def get_by_id(
        self,
        db: Session,
        codigo_producto_id: int,
    ) -> CodigoProducto | None:

        return self.repository.get_by_id(
            db,
            codigo_producto_id,
        )

    def create(
        self,
        db: Session,
        data: CodigoProductoCreate,
    ) -> CodigoProducto:

        marca = self.marca_repository.get_by_id(
            db,
            data.marca_id,
        )

        if not marca:
            raise MarcaNoEncontradaException(
                MARCA_NO_EXISTE
            )

        codigo_existente = self.repository.get_by_codigo(
            db,
            data.codigo,
        )

        if codigo_existente:
            raise CodigoProductoYaExisteException(
                CODIGO_PRODUCTO_YA_EXISTE
            )

        nuevo_codigo = CodigoProducto(
            marca_id=data.marca_id,
            codigo=data.codigo,
        )

        return self.repository.create(
            db,
            nuevo_codigo,
        )

    def update(
        self,
        db: Session,
        codigo_producto_id: int,
        data: CodigoProductoUpdate,
    ) -> CodigoProducto:

        codigo_producto = self.repository.get_by_id(
            db,
            codigo_producto_id,
        )

        if not codigo_producto:
            raise CodigoProductoNoEncontradoException(
                CODIGO_PRODUCTO_NO_EXISTE
            )

        if data.marca_id is not None:

            marca = self.marca_repository.get_by_id(
                db,
                data.marca_id,
            )

            if not marca:
                raise MarcaNoEncontradaException(
                    MARCA_NO_EXISTE
                )

            codigo_producto.marca_id = data.marca_id

        if data.codigo is not None:

            codigo_existente = self.repository.get_by_codigo(
                db,
                data.codigo,
            )

            if (
                codigo_existente
                and codigo_existente.id != codigo_producto.id
            ):
                raise CodigoProductoYaExisteException(
                    CODIGO_PRODUCTO_YA_EXISTE
                )

            codigo_producto.codigo = data.codigo

        if data.estado is not None:
            codigo_producto.estado = data.estado

        return self.repository.update(
            db,
            codigo_producto,
        )

    def delete(
        self,
        db: Session,
        codigo_producto_id: int,
    ) -> None:

        codigo_producto = self.repository.get_by_id(
            db,
            codigo_producto_id,
        )

        if not codigo_producto:
            raise CodigoProductoNoEncontradoException(
                CODIGO_PRODUCTO_NO_EXISTE
            )

        if locals().get('item') and getattr(locals()['item'], 'estado', False) or (locals().get('codigo_producto') and getattr(locals().get('codigo_producto'), 'estado', False)):
            raise RegistroActivoNoPuedeEliminarseException('No se puede eliminar físicamente un registro activo. Envíelo a la papelera primero.')
        if codigo_producto.estado == True:
            raise RegistroActivoNoPuedeEliminarseException('No se puede eliminar un registro activo.')

        self.repository.delete(
            db,
            codigo_producto,
        )