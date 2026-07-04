from sqlalchemy.orm import Session

from app.modules.producto.constants import (
    PRODUCTO_NO_EXISTE,
    PRODUCTO_YA_EXISTE,
)

from app.modules.producto.exceptions import (
    ProductoNoEncontradoException,
    ProductoYaExisteException,
)

from app.modules.producto.models import Producto
from app.modules.producto.repository import ProductoRepository
from app.modules.producto.schemas import (
    ProductoCreate,
    ProductoUpdate,
)

from app.modules.codigo_producto.constants import CODIGO_PRODUCTO_NO_EXISTE
from app.modules.codigo_producto.exceptions import CodigoProductoNoEncontradoException
from app.modules.codigo_producto.repository import CodigoProductoRepository

from app.modules.tipo_calzado.constants import TIPO_CALZADO_NO_EXISTE
from app.modules.tipo_calzado.exceptions import TipoCalzadoNoEncontradoException
from app.modules.tipo_calzado.repository import TipoCalzadoRepository

from app.modules.material.constants import MATERIAL_NO_EXISTE
from app.modules.material.exceptions import MaterialNoEncontradoException
from app.modules.material.repository import MaterialRepository

from app.modules.color.constants import COLOR_NO_EXISTE
from app.modules.color.exceptions import ColorNoEncontradoException
from app.modules.color.repository import ColorRepository

from app.modules.talla.constants import TALLA_NO_EXISTE
from app.modules.talla.exceptions import TallaNoEncontradaException
from app.modules.talla.repository import TallaRepository

from datetime import datetime

from app.modules.producto.schemas import (
    ProductoCompletoCreate,
)

from app.modules.codigo_producto.models import CodigoProducto

from app.modules.precio_producto.models import PrecioProducto

from app.modules.producto_imagen.models import ProductoImagen
class ProductoService:

    def __init__(self):
        self.repository = ProductoRepository()
        self.codigo_repository = CodigoProductoRepository()
        self.tipo_repository = TipoCalzadoRepository()
        self.material_repository = MaterialRepository()
        self.color_repository = ColorRepository()
        self.talla_repository = TallaRepository()

    def get_all(
        self,
        db: Session,
    ) -> list[Producto]:

        return self.repository.get_all(db)

    def get_by_id(
        self,
        db: Session,
        producto_id: int,
    ) -> Producto | None:

        return self.repository.get_by_id(
            db,
            producto_id,
        )

    def create(
        self,
        db: Session,
        data: ProductoCreate,
    ) -> Producto:

        if not self.codigo_repository.get_by_id(db, data.codigo_producto_id):
            raise CodigoProductoNoEncontradoException(
                CODIGO_PRODUCTO_NO_EXISTE
            )

        if not self.tipo_repository.get_by_id(db, data.tipo_calzado_id):
            raise TipoCalzadoNoEncontradoException(
                TIPO_CALZADO_NO_EXISTE
            )

        if not self.material_repository.get_by_id(db, data.material_id):
            raise MaterialNoEncontradoException(
                MATERIAL_NO_EXISTE
            )

        if not self.color_repository.get_by_id(db, data.color_id):
            raise ColorNoEncontradoException(
                COLOR_NO_EXISTE
            )

        if not self.talla_repository.get_by_id(db, data.talla_id):
            raise TallaNoEncontradaException(
                TALLA_NO_EXISTE
            )

        if self.repository.exists(
            db,
            data.codigo_producto_id,
            data.color_id,
            data.talla_id,
        ):
            raise ProductoYaExisteException(
                PRODUCTO_YA_EXISTE
            )

        producto = Producto(**data.model_dump())

        return self.repository.create(
            db,
            producto,
        )

    def update(
        self,
        db: Session,
        producto_id: int,
        data: ProductoUpdate,
    ) -> Producto:

        producto = self.repository.get_by_id(
            db,
            producto_id,
        )

        if not producto:
            raise ProductoNoEncontradoException(
                PRODUCTO_NO_EXISTE
            )

        update_data = data.model_dump(
            exclude_unset=True
        )

        for campo, valor in update_data.items():
            setattr(
                producto,
                campo,
                valor,
            )

        return self.repository.update(
            db,
            producto,
        )

    def delete(
        self,
        db: Session,
        producto_id: int,
    ) -> None:

        producto = self.repository.get_by_id(
            db,
            producto_id,
        )

        if not producto:
            raise ProductoNoEncontradoException(
                PRODUCTO_NO_EXISTE
            )

        self.repository.delete(
            db,
            producto,
        )
def create_completo(
    self,
    db: Session,
    data: ProductoCompletoCreate,
):
    """
    Crea un producto completo en una sola transacción.
    """

    try:

        # ==================================================
        # VALIDAR CATÁLOGOS
        # ==================================================

        if not self.marca_repository.get_by_id(
            db,
            data.marca_id,
        ):
            raise MarcaNoEncontradaException(
                MARCA_NO_EXISTE
            )

        if not self.tipo_repository.get_by_id(
            db,
            data.tipo_calzado_id,
        ):
            raise TipoCalzadoNoEncontradoException(
                TIPO_CALZADO_NO_EXISTE
            )

        if not self.material_repository.get_by_id(
            db,
            data.material_id,
        ):
            raise MaterialNoEncontradoException(
                MATERIAL_NO_EXISTE
            )

        for variante in data.variantes:

            if not self.color_repository.get_by_id(
                db,
                variante.color_id,
            ):
                raise ColorNoEncontradoException(
                    COLOR_NO_EXISTE
                )

            if not self.talla_repository.get_by_id(
                db,
                variante.talla_id,
            ):
                raise TallaNoEncontradaException(
                    TALLA_NO_EXISTE
                )

        # ==================================================
        # VALIDAR CÓDIGO
        # ==================================================

        if self.codigo_repository.get_by_codigo(
            db,
            data.codigo,
        ):
            raise CodigoProductoYaExisteException(
                CODIGO_PRODUCTO_YA_EXISTE
            )

        # ==================================================
        # CREAR CÓDIGO PRODUCTO
        # ==================================================

        codigo_producto = CodigoProducto(
            marca_id=data.marca_id,
            codigo=data.codigo,
            estado=True,
        )

        db.add(codigo_producto)
        db.flush()

        productos = []

        # ==================================================
        # CREAR PRODUCTOS + PRECIOS
        # ==================================================

        for variante in data.variantes:

            producto = Producto(
                codigo_producto_id=codigo_producto.id,
                tipo_calzado_id=data.tipo_calzado_id,
                material_id=data.material_id,
                color_id=variante.color_id,
                talla_id=variante.talla_id,
                descripcion=data.descripcion,
                stock_actual=variante.stock_actual,
                stock_minimo=variante.stock_minimo,
                stock_maximo=variante.stock_maximo,
                estado=variante.estado,
            )

            db.add(producto)
            db.flush()

            productos.append(producto)

            precio = PrecioProducto(
                producto_id=producto.id,
                precio_compra=variante.precio_compra,
                precio_venta=variante.precio_venta,
                vigente_desde=datetime.now(),
                estado=True,
            )

            db.add(precio)

        # ==================================================
        # IMÁGENES
        # ==================================================

        if productos:

            producto_principal = productos[0]

            for imagen in data.imagenes:

                db.add(
                    ProductoImagen(
                        producto_id=producto_principal.id,
                        bucket=imagen.bucket,
                        ruta=imagen.ruta,
                        nombre_archivo=imagen.nombre_archivo,
                        es_principal=imagen.es_principal,
                        orden=imagen.orden,
                    )
                )

        db.commit()

        return {
            "codigo_producto_id": codigo_producto.id,
            "variantes_creadas": len(productos),
            "precios_creados": len(productos),
            "imagenes_creadas": len(data.imagenes),
            "success": True,
            "message": "Producto creado correctamente.",
            "created_at": datetime.now(),
        }

    except Exception:

        db.rollback()

        raise