from pydantic import BaseModel

class DashboardProductos(BaseModel):
    total: int
    activos: int
    inactivos: int
    eliminados: int

class DashboardInventario(BaseModel):
    stock_total: int
    sin_stock: int
    stock_bajo: int
    stock_maximo: int

class DashboardCatalogo(BaseModel):
    marcas: int
    tipos_calzado: int
    materiales: int
    colores: int
    tallas: int

class DashboardCalidad(BaseModel):
    sin_imagen_principal: int
    sin_precio_vigente: int

class DashboardResponse(BaseModel):
    productos: DashboardProductos
    inventario: DashboardInventario
    catalogo: DashboardCatalogo
    calidad: DashboardCalidad
