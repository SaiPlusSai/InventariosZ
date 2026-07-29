from sqlalchemy.orm import Session, joinedload, Query
from sqlalchemy import or_
from app.modules.movimiento_inventario.models import MovimientoInventario
from app.modules.movimiento_inventario.schemas import MovimientoFiltro
from app.modules.producto.models import Producto
from app.modules.codigo_producto.models import CodigoProducto
from app.modules.marca.models import Marca
from app.modules.tipo_calzado.models import TipoCalzado
from app.modules.material.models import Material
from app.modules.color.models import Color
from app.modules.talla.models import Talla

class MovimientoInventarioRepository:
    def create(self, db: Session, obj_in: MovimientoInventario) -> MovimientoInventario:
        db.add(obj_in)
        db.flush() # Importante usar flush en vez de commit para mantener la transacción abierta en el service
        return obj_in

    def get_kardex_by_producto(self, db: Session, producto_id: int, skip: int = 0, limit: int = 100):
        return db.query(MovimientoInventario)\
            .filter(MovimientoInventario.producto_id == producto_id)\
            .order_by(MovimientoInventario.created_at.desc())\
            .offset(skip).limit(limit).all()

    def _aplicar_filtros(self, query: Query, filtros: MovimientoFiltro) -> Query:
        """
        Aplica dinámicamente los filtros a la consulta principal para reutilizar lógica
        entre el listado y el conteo total.
        """
        # Debe incluir los JOINs explícitos para que funcione el filtrado (Eager load ya los hace para select, 
        # pero necesitamos hacer outerjoin explícito si vamos a filtrar sin cargarlos o usar joinedload).
        # Como usamos joinedload, los inner tables están disponibles en memoria, pero para SQLAlchemy WHERE 
        # necesitamos join explícito si no usamos contains_eager. 
        # La forma más segura es hacer un join explícito para filtrado.
        # Usamos las relaciones explícitas definidas en los modelos SQLAlchemy.
        # Esto previene errores de "attribute not found" y respeta estrictamente la arquitectura.
        query = query.join(MovimientoInventario.producto)
        query = query.outerjoin(Producto.codigo_producto)
        query = query.outerjoin(CodigoProducto.marca)
        query = query.outerjoin(Producto.tipo_calzado)
        query = query.outerjoin(Producto.material)
        query = query.outerjoin(Producto.color)
        query = query.outerjoin(Producto.talla)

        if filtros.producto_id:
            query = query.filter(MovimientoInventario.producto_id == filtros.producto_id)
        if filtros.tipo_movimiento:
            query = query.filter(MovimientoInventario.tipo_movimiento == filtros.tipo_movimiento)
        if filtros.origen:
            query = query.filter(MovimientoInventario.origen == filtros.origen)
        if filtros.observacion:
            query = query.filter(MovimientoInventario.observacion.ilike(f'%{filtros.observacion}%'))
        
        if filtros.fecha_inicio:
            query = query.filter(MovimientoInventario.created_at >= filtros.fecha_inicio)
        if filtros.fecha_fin:
            query = query.filter(MovimientoInventario.created_at <= filtros.fecha_fin)
            
        if filtros.cantidad_min is not None:
            query = query.filter(MovimientoInventario.cantidad >= filtros.cantidad_min)
        if filtros.cantidad_max is not None:
            query = query.filter(MovimientoInventario.cantidad <= filtros.cantidad_max)

        if filtros.codigo:
            query = query.filter(CodigoProducto.codigo.ilike(f'%{filtros.codigo}%'))
        if filtros.marca:
            query = query.filter(Marca.nombre.ilike(f'%{filtros.marca}%'))
        if filtros.tipo_calzado:
            query = query.filter(TipoCalzado.nombre.ilike(f'%{filtros.tipo_calzado}%'))
        if filtros.material:
            query = query.filter(Material.nombre.ilike(f'%{filtros.material}%'))
        if filtros.color:
            query = query.filter(Color.nombre.ilike(f'%{filtros.color}%'))
        if filtros.talla:
            query = query.filter(Talla.nombre.ilike(f'%{filtros.talla}%'))

        if filtros.search:
            search_term = f'%{filtros.search}%'
            query = query.filter(or_(
                CodigoProducto.codigo.ilike(search_term),
                Marca.nombre.ilike(search_term),
                Material.nombre.ilike(search_term),
                TipoCalzado.nombre.ilike(search_term),
                Color.nombre.ilike(search_term),
                Talla.nombre.ilike(search_term),
                MovimientoInventario.observacion.ilike(search_term)
            ))
            
        return query

    def _aplicar_ordenamiento(self, query: Query, filtros: MovimientoFiltro) -> Query:
        """
        Aplica el ordenamiento dinámico
        """
        order_col = MovimientoInventario.created_at
        
        if filtros.sort_by == 'codigo':
            order_col = CodigoProducto.codigo
        elif filtros.sort_by == 'cantidad':
            order_col = MovimientoInventario.cantidad
        elif filtros.sort_by == 'stock_anterior':
            order_col = MovimientoInventario.stock_anterior
        elif filtros.sort_by == 'stock_nuevo':
            order_col = MovimientoInventario.stock_nuevo
        elif filtros.sort_by == 'tipo_movimiento':
            order_col = MovimientoInventario.tipo_movimiento
        # por defecto 'fecha' es created_at
        
        if filtros.sort_order == 'asc':
            return query.order_by(order_col.asc())
        return query.order_by(order_col.desc())

    def listar_movimientos(self, db: Session, filtros: MovimientoFiltro, skip: int = 0, limit: int = 50) -> list[MovimientoInventario]:
        """
        Obtiene la lista de todos los movimientos con carga adelantada optimizada (Eager Loading).
        Preparado para soportar filtros futuros.
        """
        query = db.query(MovimientoInventario).options(
            joinedload(MovimientoInventario.producto).joinedload(Producto.codigo_producto).joinedload(CodigoProducto.marca),
            joinedload(MovimientoInventario.producto).joinedload(Producto.tipo_calzado),
            joinedload(MovimientoInventario.producto).joinedload(Producto.material),
            joinedload(MovimientoInventario.producto).joinedload(Producto.color),
            joinedload(MovimientoInventario.producto).joinedload(Producto.talla)
        )
        
        query = self._aplicar_filtros(query, filtros)
        query = self._aplicar_ordenamiento(query, filtros)
        
        return query.offset(skip).limit(limit).all()

    def contar_movimientos_total(self, db: Session, filtros: MovimientoFiltro) -> int:
        """
        Obtiene el total de movimientos en la tabla. Preparado para aplicar filtros.
        """
        query = db.query(MovimientoInventario)
        query = self._aplicar_filtros(query, filtros)
        return query.count()

    def count_kardex_by_producto(self, db: Session, producto_id: int) -> int:
        return db.query(MovimientoInventario).filter(MovimientoInventario.producto_id == producto_id).count()

movimiento_repository = MovimientoInventarioRepository()
