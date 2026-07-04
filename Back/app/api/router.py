from fastapi import APIRouter

from app.modules.color.router import router as color_router
from app.modules.marca.router import router as marca_router
from app.modules.material.router import router as material_router
from app.modules.talla.router import router as talla_router
from app.modules.tipo_calzado.router import router as tipo_calzado_router
from app.modules.codigo_producto.router import router as codigo_producto_router

api_router = APIRouter()

api_router.include_router(marca_router)
api_router.include_router(material_router)
api_router.include_router(color_router)
api_router.include_router(talla_router)
api_router.include_router(tipo_calzado_router)
api_router.include_router(codigo_producto_router)