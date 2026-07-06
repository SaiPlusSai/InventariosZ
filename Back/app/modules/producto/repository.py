from sqlalchemy import and_
from sqlalchemy import func
from sqlalchemy import or_
from sqlalchemy import select
from sqlalchemy import update
from sqlalchemy import select
from sqlalchemy.orm import Session
import time

from app.modules.codigo_producto.models import CodigoProducto
from app.modules.color.models import Color
from app.modules.marca.models import Marca
from app.modules.material.models import Material
from app.modules.precio_producto.models import PrecioProducto
from app.modules.producto.models import Producto
from app.modules.producto_imagen.models import ProductoImagen
from app.modules.talla.models import Talla
from app.modules.tipo_calzado.models import TipoCalzado
from sqlalchemy import delete
from sqlalchemy import select

from app.modules.codigo_producto.models import CodigoProducto
from app.modules.precio_producto.models import PrecioProducto
from app.modules.producto_imagen.models import ProductoImagen


class ProductoRepository:
    """
    Repositorio encargado exclusivamente del acceso
    a la base de datos.
    """

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
    ):

        precio_vigente = (
            select(
                PrecioProducto.producto_id.label("producto_id"),
                PrecioProducto.precio_compra.label("precio_compra"),
                PrecioProducto.precio_venta.label("precio_venta"),
                func.row_number()
                .over(
                    partition_by=PrecioProducto.producto_id,
                    order_by=(
                        PrecioProducto.vigente_desde.desc(),
                        PrecioProducto.created_at.desc(),
                        PrecioProducto.id.desc(),
                    ),
                )
                .label("rn"),
            )
            .where(
                PrecioProducto.estado.is_(True),
                PrecioProducto.vigente_desde <= func.now(),
                or_(
                    PrecioProducto.vigente_hasta.is_(None),
                    PrecioProducto.vigente_hasta >= func.now(),
                ),
            )
            .subquery()
        )

        imagen_principal = (
            select(
                ProductoImagen.producto_id.label("producto_id"),
                ProductoImagen.ruta.label("imagen_principal"),
                func.row_number()
                .over(
                    partition_by=ProductoImagen.producto_id,
                    order_by=(
                        ProductoImagen.orden.asc(),
                        ProductoImagen.id.asc(),
                    ),
                )
                .label("rn"),
            )
            .where(ProductoImagen.es_principal.is_(True))
            .subquery()
        )

        statement = (
            select(
                Producto.id.label("id"),
                CodigoProducto.id.label("codigo_producto_id"),
                CodigoProducto.codigo.label("codigo"),
                Producto.descripcion.label("descripcion"),
                Marca.id.label("marca_id"),
                Marca.nombre.label("marca_nombre"),
                TipoCalzado.id.label("tipo_calzado_id"),
                TipoCalzado.nombre.label("tipo_calzado_nombre"),
                Material.id.label("material_id"),
                Material.nombre.label("material_nombre"),
                Color.id.label("color_id"),
                Color.nombre.label("color_nombre"),
                Talla.id.label("talla_id"),
                Talla.nombre.label("talla_nombre"),
                Producto.stock_actual.label("stock_actual"),
                Producto.stock_minimo.label("stock_minimo"),
                Producto.stock_maximo.label("stock_maximo"),
                precio_vigente.c.precio_compra.label("precio_compra"),
                precio_vigente.c.precio_venta.label("precio_venta"),
                imagen_principal.c.imagen_principal.label("imagen_principal"),
                Producto.estado.label("estado"),
                Producto.created_at.label("created_at"),
                Producto.updated_at.label("updated_at"),
            )
            .join(
                CodigoProducto,
                Producto.codigo_producto_id == CodigoProducto.id,
            )
            .join(
                Marca,
                CodigoProducto.marca_id == Marca.id,
            )
            .join(
                TipoCalzado,
                Producto.tipo_calzado_id == TipoCalzado.id,
            )
            .join(
                Material,
                Producto.material_id == Material.id,
            )
            .join(
                Color,
                Producto.color_id == Color.id,
            )
            .join(
                Talla,
                Producto.talla_id == Talla.id,
            )
            .outerjoin(
                precio_vigente,
                and_(
                    precio_vigente.c.producto_id == Producto.id,
                    precio_vigente.c.rn == 1,
                ),
            )
            .outerjoin(
                imagen_principal,
                and_(
                    imagen_principal.c.producto_id == Producto.id,
                    imagen_principal.c.rn == 1,
                ),
            )
            .order_by(Producto.id.desc())
        )

        if codigo:
            statement = statement.where(
                CodigoProducto.codigo.ilike(f"%{codigo}%")
            )

        if marca_id is not None:
            statement = statement.where(Marca.id == marca_id)

        if marca:
            statement = statement.where(Marca.nombre.ilike(f"%{marca}%"))

        if color_id is not None:
            statement = statement.where(Color.id == color_id)

        if color:
            statement = statement.where(Color.nombre.ilike(f"%{color}%"))

        if material_id is not None:
            statement = statement.where(Material.id == material_id)

        if material:
            statement = statement.where(Material.nombre.ilike(f"%{material}%"))

        if talla_id is not None:
            statement = statement.where(Talla.id == talla_id)

        if talla:
            statement = statement.where(Talla.nombre.ilike(f"%{talla}%"))

        if tipo_calzado_id is not None:
            statement = statement.where(TipoCalzado.id == tipo_calzado_id)

        if tipo:
            statement = statement.where(TipoCalzado.nombre.ilike(f"%{tipo}%"))

        return db.execute(statement).mappings().all()

    def get_by_id(
        self,
        db: Session,
        producto_id: int,
    ) -> Producto | None:

        statement = (
            select(Producto)
            .where(
                Producto.id == producto_id
            )
        )

        return db.scalar(statement)
    def get_detalle(
        self,
        db: Session,
        producto_id: int,
    ) -> Producto | None:
        
        statement = (
            select(Producto)
            .where(
                Producto.id == producto_id
            )
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

        statement = (
            select(Producto)
            .where(
                Producto.codigo_producto_id == codigo_producto_id,
                Producto.color_id == color_id,
                Producto.talla_id == talla_id,
            )
        )

        return db.scalar(statement)
    def get_by_codigo_producto_id(
        self,
        db: Session,
        codigo_producto_id: int,
    ) -> list[Producto]:

        statement = (
            select(Producto)
            .where(
                Producto.codigo_producto_id == codigo_producto_id
            )
            .order_by(
                Producto.id.asc()
            )
        )

        return db.scalars(statement).all()


    def get_editar_completo(
        self,
        db: Session,
        codigo_producto_id: int,
    ) -> CodigoProducto | None:

        statement = (
            select(CodigoProducto)
            .where(
                CodigoProducto.id == codigo_producto_id
            )
        )

        return db.scalar(statement)


    def delete_precios(
        self,
        db: Session,
        producto_id: int,
    ):

        db.execute(
            delete(PrecioProducto)
            .where(
                PrecioProducto.producto_id == producto_id
            )
        )


    def delete_imagenes(
        self,
        db: Session,
        producto_id: int,
    ):

        db.execute(
            delete(ProductoImagen)
            .where(
                ProductoImagen.producto_id == producto_id
            )
        )


    def delete_producto(
        self,
        db: Session,
        producto_id: int,
    ):

        db.execute(
            delete(Producto)
            .where(
                Producto.id == producto_id
            )
        )


    def delete_productos_codigo(
        self,
        db: Session,
        codigo_producto_id: int,
    ):

        productos = self.get_by_codigo_producto_id(
            db,
            codigo_producto_id,
        )

        for producto in productos:

            self.delete_precios(
                db,
                producto.id,
            )

            self.delete_imagenes(
                db,
                producto.id,
            )

            self.delete_producto(
                db,
                producto.id,
            )


    def save_codigo_producto(
        self,
        db: Session,
        codigo_producto: CodigoProducto,
    ):

        db.add(codigo_producto)
        db.flush()


    def save_producto(
        self,
        db: Session,
        producto: Producto,
    ):

        db.add(producto)
        db.flush()

        return producto


    def save_precio(
        self,
        db: Session,
        precio: PrecioProducto,
    ):

        db.add(precio)
        db.flush()


    def save_imagen(
        self,
        db: Session,
        imagen: ProductoImagen,
    ):

        db.add(imagen)
        db.flush()


    def commit(
        self,
        db: Session,
    ):

        db.commit()


    def rollback(
        self,
        db: Session,
    ):

        db.rollback()
    def incrementar_stock(
        self,
        db: Session,
        producto_id: int,
    ) -> int | None:

        stock = db.execute(
            update(Producto)
            .where(
                Producto.id == producto_id
            )
            .values(
                stock_actual=Producto.stock_actual + 1
            )
            .returning(
                Producto.stock_actual
            )
        ).scalar_one_or_none()

        if stock is None:
            db.rollback()
            return None

        db.commit()

        return stock
    def decrementar_stock(
        self,
        db: Session,
        producto_id: int,
    ) -> int | None:

        stock = db.execute(
            update(Producto)
            .where(
                Producto.id == producto_id,
                Producto.stock_actual > 0,
            )
            .values(
                stock_actual=Producto.stock_actual - 1
            )
            .returning(
                Producto.stock_actual
            )
        ).scalar_one_or_none()

        if stock is None:
            db.rollback()
            return None

        db.commit()

        return stock
