from datetime import datetime

from sqlalchemy.orm import Session
from app.modules.producto.websocket import manager
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
from app.modules.color.constants import COLOR_NO_EXISTE
from app.modules.color.exceptions import ColorNoEncontradoException
from app.modules.color.repository import ColorRepository
from app.modules.marca.constants import MARCA_NO_EXISTE
from app.modules.marca.exceptions import MarcaNoEncontradaException
from app.modules.marca.repository import MarcaRepository
from app.modules.material.constants import MATERIAL_NO_EXISTE
from app.modules.material.exceptions import MaterialNoEncontradoException
from app.modules.material.repository import MaterialRepository
from app.modules.precio_producto.models import PrecioProducto
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
    ColorInfo,
    MarcaInfo,
    MaterialInfo,
    ProductoCompletoCreate,
    ProductoCreate,
    ProductoListadoResponse,
    ProductoUpdate,
    TallaInfo,
    TipoCalzadoInfo,
    ProductoDetalleResponse,
    PrecioDetalleResponse,
    ImagenDetalleResponse,
)
from app.modules.producto_imagen.models import ProductoImagen
from app.modules.talla.constants import TALLA_NO_EXISTE
from app.modules.talla.exceptions import TallaNoEncontradaException
from app.modules.talla.repository import TallaRepository
from app.modules.tipo_calzado.constants import TIPO_CALZADO_NO_EXISTE
from app.modules.tipo_calzado.exceptions import TipoCalzadoNoEncontradoException
from app.modules.tipo_calzado.repository import TipoCalzadoRepository


class ProductoService:

    def __init__(self):
        self.repository = ProductoRepository()
        self.codigo_repository = CodigoProductoRepository()
        self.marca_repository = MarcaRepository()
        self.tipo_repository = TipoCalzadoRepository()
        self.material_repository = MaterialRepository()
        self.color_repository = ColorRepository()
        self.talla_repository = TallaRepository()

    def get_all(
        self,
        db: Session,
        codigo: str | None = None,
        marca_id: int | None = None,
        marca: str | None = None,
        color_id: int | None = None,
        color: str | None = None,
        material_id: int | None = None,
        material: str | None = None,
        talla_id: int | None = None,
        talla: str | None = None,
        tipo_calzado_id: int | None = None,
        tipo: str | None = None,
    ) -> list[ProductoListadoResponse]:

        productos = self.repository.get_all(
            db,
            codigo=codigo,
            marca_id=marca_id,
            marca=marca,
            color_id=color_id,
            color=color,
            material_id=material_id,
            material=material,
            talla_id=talla_id,
            talla=talla,
            tipo_calzado_id=tipo_calzado_id,
            tipo=tipo,
        )

        return [
            ProductoListadoResponse(
                id=producto["id"],
                codigo=producto["codigo"],
                descripcion=producto["descripcion"],
                marca=MarcaInfo(
                    id=producto["marca_id"],
                    nombre=producto["marca_nombre"],
                ),
                tipo_calzado=TipoCalzadoInfo(
                    id=producto["tipo_calzado_id"],
                    nombre=producto["tipo_calzado_nombre"],
                ),
                material=MaterialInfo(
                    id=producto["material_id"],
                    nombre=producto["material_nombre"],
                ),
                color=ColorInfo(
                    id=producto["color_id"],
                    nombre=producto["color_nombre"],
                ),
                talla=TallaInfo(
                    id=producto["talla_id"],
                    nombre=producto["talla_nombre"],
                ),
                stock_actual=producto["stock_actual"],
                stock_minimo=producto["stock_minimo"],
                stock_maximo=producto["stock_maximo"],
                precio_compra=producto["precio_compra"],
                precio_venta=producto["precio_venta"],
                imagen_principal=producto["imagen_principal"],
                estado=producto["estado"],
                created_at=producto["created_at"],
                updated_at=producto["updated_at"],
            )
            for producto in productos
        ]
    def get_detalle(
        self,
        db: Session,
        producto_id: int,
    ) -> ProductoDetalleResponse:

        producto = self.repository.get_detalle(
            db,
            producto_id,
        )

        if not producto:
            raise ProductoNoEncontradoException(
                PRODUCTO_NO_EXISTE
            )

        precio = next(
            (
                p
                for p in producto.precios
                if p.estado
            ),
            None,
        )

        imagen_principal = next(
            (
                img.ruta
                for img in producto.imagenes
                if img.es_principal
            ),
            None,
        )

        return ProductoDetalleResponse(

            id=producto.id,

            codigo=producto.codigo_producto.codigo,

            descripcion=producto.descripcion,

            marca=MarcaInfo(
                id=producto.codigo_producto.marca.id,
                nombre=producto.codigo_producto.marca.nombre,
            ),

            tipo_calzado=TipoCalzadoInfo(
                id=producto.tipo_calzado.id,
                nombre=producto.tipo_calzado.nombre,
            ),

            material=MaterialInfo(
                id=producto.material.id,
                nombre=producto.material.nombre,
            ),

            color=ColorInfo(
                id=producto.color.id,
                nombre=producto.color.nombre,
                codigo_hex=producto.color.codigo_hex,
            ),

            talla=TallaInfo(
                id=producto.talla.id,
                nombre=producto.talla.nombre,
            ),

            stock_actual=producto.stock_actual,
            stock_minimo=producto.stock_minimo,
            stock_maximo=producto.stock_maximo,

            precio=(
                PrecioDetalleResponse(
                    precio_compra=precio.precio_compra,
                    precio_venta=precio.precio_venta,
                )
                if precio
                else None
            ),

            imagen_principal=imagen_principal,

            imagenes=[
                ImagenDetalleResponse(
                    id=img.id,
                    bucket=img.bucket,
                    ruta=img.ruta,
                    nombre_archivo=img.nombre_archivo,
                    es_principal=img.es_principal,
                    orden=img.orden,
                )
                for img in producto.imagenes
            ],

            estado=producto.estado,

            created_at=producto.created_at,

            updated_at=producto.updated_at,
    )    
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
    async def incrementar_stock(
        self,
        db: Session,
        producto_id: int,
    ):
        stock = self.repository.incrementar_stock(
            db,
            producto_id,
        )

        if stock is None:
            raise ProductoNoEncontradoException(
                PRODUCTO_NO_EXISTE
            )

        await manager.broadcast_stock(
            producto_id,
            stock,
        )       

        return {
            "producto_id": producto_id,
            "stock_actual": stock,
        }
    async def decrementar_stock(
        self,
        db: Session,
        producto_id: int,
    ):
        stock = self.repository.decrementar_stock(
            db,
            producto_id,
        )

        if stock is None:
            raise ProductoNoEncontradoException(
                PRODUCTO_NO_EXISTE
            )
        await manager.broadcast_stock(
            producto_id,
            stock,
        )       

        return {
            "producto_id": producto_id,
            "stock_actual": stock,
        }
    def create_completo(
        self,
        db: Session,
        data: ProductoCompletoCreate,
    ):
        """
        Crea un producto completo en una sola transaccion.
        """

        try:
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

            variantes_unicas = set()

            for variante in data.variantes:
                clave_variante = (
                    variante.color_id,
                    variante.talla_id,
                )

                if clave_variante in variantes_unicas:
                    raise ProductoYaExisteException(
                        PRODUCTO_YA_EXISTE
                    )

                variantes_unicas.add(clave_variante)

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

            if self.codigo_repository.get_by_codigo(
                db,
                data.codigo,
            ):
                raise CodigoProductoYaExisteException(
                    CODIGO_PRODUCTO_YA_EXISTE
                )

            codigo_producto = CodigoProducto(
                marca_id=data.marca_id,
                codigo=data.codigo,
                estado=True,
            )

            db.add(codigo_producto)
            db.flush()

            productos = []

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

            if productos:
                producto_principal = productos[0]
                ya_tiene_principal = False

                for imagen in data.imagenes:
                    es_principal = imagen.es_principal

                    if es_principal and ya_tiene_principal:
                        es_principal = False

                    if es_principal:
                        ya_tiene_principal = True

                    db.add(
                        ProductoImagen(
                            producto_id=producto_principal.id,
                            bucket=imagen.bucket,
                            ruta=imagen.ruta,
                            nombre_archivo=imagen.nombre_archivo,
                            es_principal=es_principal,
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
