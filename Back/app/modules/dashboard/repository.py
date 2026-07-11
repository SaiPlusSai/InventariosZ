from sqlalchemy.orm import Session
from sqlalchemy import func, case, select, desc
from app.modules.producto.models import Producto
from app.modules.codigo_producto.models import CodigoProducto
from app.modules.marca.models import Marca
from app.modules.tipo_calzado.models import TipoCalzado
from app.modules.material.models import Material
from app.modules.color.models import Color
from app.modules.talla.models import Talla
from app.modules.producto_imagen.models import ProductoImagen
from app.modules.precio_producto.models import PrecioProducto

class DashboardRepository:
    def get_stats(self, db: Session) -> dict:
        # 1. Agregaciones de Producto
        # Usamos case para sumar solo cuando la condicion se cumple
        res_productos = db.query(
            func.count(Producto.id).label("total"),
            func.sum(case((Producto.estado == True, 1), else_=0)).label("activos"),
            func.sum(case((Producto.estado == False, 1), else_=0)).label("inactivos"),
            func.sum(case((Producto.deleted_at.isnot(None), 1), else_=0)).label("eliminados")
        ).first()

        # 2. Agregaciones de Inventario (Solo vigentes)
        # Filtramos eliminados. No filtramos inactivos porque el stock total puede incluir productos inactivos, 
        # pero la logica del requerimiento generalmente es sobre productos activos o no eliminados.
        # Vamos a filtrar deleted_at IS NULL
        res_inventario = db.query(
            func.coalesce(func.sum(Producto.stock_actual), 0).label("stock_total"),
            func.sum(case((Producto.stock_actual <= 0, 1), else_=0)).label("sin_stock"),
            func.sum(case((Producto.stock_actual <= Producto.stock_minimo, 1), else_=0)).label("stock_bajo"),
            func.sum(case((
                (Producto.stock_maximo.isnot(None)) & (Producto.stock_actual >= Producto.stock_maximo), 1
            ), else_=0)).label("stock_maximo")
        ).filter(Producto.deleted_at.is_(None), Producto.estado == True).first()

        # 3. Catalogo (Solo vigentes)
        marcas = db.query(func.count(Marca.id)).filter(Marca.estado == True, Marca.deleted_at.is_(None)).scalar()
        tipos_calzado = db.query(func.count(TipoCalzado.id)).filter(TipoCalzado.estado == True, TipoCalzado.deleted_at.is_(None)).scalar()
        materiales = db.query(func.count(Material.id)).filter(Material.estado == True, Material.deleted_at.is_(None)).scalar()
        colores = db.query(func.count(Color.id)).filter(Color.estado == True, Color.deleted_at.is_(None)).scalar()
        tallas = db.query(func.count(Talla.id)).filter(Talla.estado == True, Talla.deleted_at.is_(None)).scalar()

        # 4. Calidad del Catálogo
        # Productos sin imagen principal (activos)
        sin_imagen = db.query(func.count(Producto.id)).filter(
            Producto.estado == True,
            Producto.deleted_at.is_(None),
            ~Producto.imagenes.any(ProductoImagen.es_principal == True)
        ).scalar()

        # Productos sin precio vigente (activos)
        # Asumimos que un precio vigente es aquel con estado=True
        sin_precio = db.query(func.count(Producto.id)).filter(
            Producto.estado == True,
            Producto.deleted_at.is_(None),
            ~Producto.precios.any(PrecioProducto.estado == True)
        ).scalar()

        # 5. Distribución de Catálogo (Productos por categoría)
        dist_marcas = db.query(Marca.nombre.label("name"), func.count(Producto.id).label("value"))\
            .join(CodigoProducto, CodigoProducto.id == Producto.codigo_producto_id)\
            .join(Marca, Marca.id == CodigoProducto.marca_id)\
            .filter(Producto.estado == True, Producto.deleted_at.is_(None))\
            .group_by(Marca.nombre)\
            .order_by(desc("value")).all()

        dist_tipos = db.query(TipoCalzado.nombre.label("name"), func.count(Producto.id).label("value"))\
            .join(Producto, TipoCalzado.id == Producto.tipo_calzado_id)\
            .filter(Producto.estado == True, Producto.deleted_at.is_(None))\
            .group_by(TipoCalzado.nombre)\
            .order_by(desc("value")).all()

        dist_materiales = db.query(Material.nombre.label("name"), func.count(Producto.id).label("value"))\
            .join(Producto, Material.id == Producto.material_id)\
            .filter(Producto.estado == True, Producto.deleted_at.is_(None))\
            .group_by(Material.nombre)\
            .order_by(desc("value")).all()

        dist_colores = db.query(Color.nombre.label("name"), func.count(Producto.id).label("value"))\
            .join(Producto, Color.id == Producto.color_id)\
            .filter(Producto.estado == True, Producto.deleted_at.is_(None))\
            .group_by(Color.nombre)\
            .order_by(desc("value")).all()

        dist_tallas = db.query(Talla.nombre.label("name"), func.count(Producto.id).label("value"))\
            .join(Producto, Talla.id == Producto.talla_id)\
            .filter(Producto.estado == True, Producto.deleted_at.is_(None))\
            .group_by(Talla.nombre)\
            .order_by(desc("value")).all()

        # 6. Distribución de Inventario (Stock por categoría)
        stock_marcas = db.query(Marca.nombre.label("name"), func.coalesce(func.sum(Producto.stock_actual), 0).label("value"))\
            .join(CodigoProducto, CodigoProducto.id == Producto.codigo_producto_id)\
            .join(Marca, Marca.id == CodigoProducto.marca_id)\
            .filter(Producto.estado == True, Producto.deleted_at.is_(None))\
            .group_by(Marca.nombre)\
            .order_by(desc("value")).all()

        stock_tipos = db.query(TipoCalzado.nombre.label("name"), func.coalesce(func.sum(Producto.stock_actual), 0).label("value"))\
            .join(Producto, TipoCalzado.id == Producto.tipo_calzado_id)\
            .filter(Producto.estado == True, Producto.deleted_at.is_(None))\
            .group_by(TipoCalzado.nombre)\
            .order_by(desc("value")).all()

        stock_materiales = db.query(Material.nombre.label("name"), func.coalesce(func.sum(Producto.stock_actual), 0).label("value"))\
            .join(Producto, Material.id == Producto.material_id)\
            .filter(Producto.estado == True, Producto.deleted_at.is_(None))\
            .group_by(Material.nombre)\
            .order_by(desc("value")).all()

        return {
            "productos": {
                "total": int(res_productos.total or 0),
                "activos": int(res_productos.activos or 0),
                "inactivos": int(res_productos.inactivos or 0),
                "eliminados": int(res_productos.eliminados or 0)
            },
            "inventario": {
                "stock_total": int(res_inventario.stock_total or 0),
                "sin_stock": int(res_inventario.sin_stock or 0),
                "stock_bajo": int(res_inventario.stock_bajo or 0),
                "stock_maximo": int(res_inventario.stock_maximo or 0)
            },
            "catalogo": {
                "marcas": marcas,
                "tipos_calzado": tipos_calzado,
                "materiales": materiales,
                "colores": colores,
                "tallas": tallas
            },
            "calidad": {
                "sin_imagen_principal": sin_imagen,
                "sin_precio_vigente": sin_precio
            },
            "distribucion_catalogo": {
                "por_marca": [{"name": r.name, "value": r.value} for r in dist_marcas],
                "por_tipo": [{"name": r.name, "value": r.value} for r in dist_tipos],
                "por_material": [{"name": r.name, "value": r.value} for r in dist_materiales],
                "por_color": [{"name": r.name, "value": r.value} for r in dist_colores],
                "por_talla": [{"name": str(r.name), "value": r.value} for r in dist_tallas]
            },
            "distribucion_inventario": {
                "por_marca": [{"name": r.name, "value": int(r.value)} for r in stock_marcas],
                "por_tipo": [{"name": r.name, "value": int(r.value)} for r in stock_tipos],
                "por_material": [{"name": r.name, "value": int(r.value)} for r in stock_materiales]
            }
        }

dashboard_repository = DashboardRepository()
