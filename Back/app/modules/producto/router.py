from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.core.database import get_db
from fastapi import WebSocket
from fastapi import WebSocketDisconnect

from app.modules.producto.websocket import manager
from app.modules.producto.schemas import (
    ProductoCreate,
    ProductoDetalleResponse,
    ProductoListadoResponse,
    ProductoResponse,
    ProductoUpdate,
    StockResponse,
    ProductoCompletoEditarResponse,
    ProductoCompletoUpdate,
    ProductoCatalogoResponse
)

from app.modules.producto.service import ProductoService

from app.modules.codigo_producto.exceptions import (
    CodigoProductoNoEncontradoException,
    CodigoProductoYaExisteException,
)

from app.modules.tipo_calzado.exceptions import (
    TipoCalzadoNoEncontradoException,
)

from app.modules.material.exceptions import (
    MaterialNoEncontradoException,
)

from app.modules.color.exceptions import (
    ColorNoEncontradoException,
)

from app.modules.talla.exceptions import (
    TallaNoEncontradaException,
)

from app.modules.marca.exceptions import (
    MarcaNoEncontradaException,
)

from app.modules.producto.schemas import (
    ProductoCompletoCreate,
    ProductoCompletoResponse,
)
from app.modules.producto.exceptions import (
    ProductoNoEncontradoException,
    ProductoYaExisteException,
    StockInsuficienteException,
)
router = APIRouter(
    prefix="/productos",
    tags=["Productos"],
)

service = ProductoService()


@router.get(
    "/",
    response_model=list[ProductoListadoResponse],
)
def get_all(
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
    db: Session = Depends(get_db),
):
    return service.get_all(
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

@router.get(
    "/catalogo",
    response_model=list[ProductoCatalogoResponse],
)
def get_catalogo(
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
    db: Session = Depends(get_db),
):
    return service.get_catalogo(
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



@router.get(
    "/papelera",
    response_model=list[ProductoListadoResponse],
)
def get_papelera(
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
    db: Session = Depends(get_db),
):
    return service.get_papelera(
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

@router.get(
    "/{producto_id}/dependencias",
)
def get_dependencias(producto_id: int, db: Session = Depends(get_db)):
    return service.get_dependencias(db, producto_id)

@router.patch(
    "/{producto_id}/desactivar",
    response_model=ProductoResponse,
)
def desactivar(producto_id: int, db: Session = Depends(get_db)):
    return service.desactivar(db, producto_id)

@router.patch(
    "/{producto_id}/recuperar",
    response_model=ProductoResponse,
)
def recuperar(producto_id: int, db: Session = Depends(get_db)):
    return service.recuperar(db, producto_id)

@router.get(
    "/{producto_id}",
    response_model=ProductoResponse,
)
def get_by_id(
    producto_id: int,
    db: Session = Depends(get_db),
):

    producto = service.get_by_id(
        db,
        producto_id,
    )

    if producto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado.",
        )

    return producto


@router.post(
    "/",
    response_model=ProductoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: ProductoCreate,
    db: Session = Depends(get_db),
):

    try:
        return service.create(
            db,
            data,
        )

    except (
        CodigoProductoNoEncontradoException,
        TipoCalzadoNoEncontradoException,
        MaterialNoEncontradoException,
        ColorNoEncontradoException,
        TallaNoEncontradaException,
    ) as e:

        raise HTTPException(
            status_code=404,
            detail=str(e),
        )

    except ProductoYaExisteException as e:

        raise HTTPException(
            status_code=409,
            detail=str(e),
        )


@router.put(
    "/{producto_id}",
    response_model=ProductoResponse,
)
def update(
    producto_id: int,
    data: ProductoUpdate,
    db: Session = Depends(get_db),
):

    try:
        return service.update(
            db,
            producto_id,
            data,
        )

    except ProductoNoEncontradoException as e:

        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    producto_id: int,
    db: Session = Depends(get_db),
):

    try:

        service.delete(
            db,
            producto_id,
        )

    except ProductoNoEncontradoException as e:

        raise HTTPException(
            status_code=404,
            detail=str(e),
        )
@router.post(
    "/crear-completo",
    response_model=ProductoCompletoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_completo(
    data: ProductoCompletoCreate,
    db: Session = Depends(get_db),
):

    try:

        return service.create_completo(
            db,
            data,
        )

    except (
        MarcaNoEncontradaException,
        TipoCalzadoNoEncontradoException,
        MaterialNoEncontradoException,
        ColorNoEncontradoException,
        TallaNoEncontradaException,
        CodigoProductoYaExisteException,
        ProductoYaExisteException,
    ) as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
@router.get(
    "/{producto_id}/detalle",
    response_model=ProductoDetalleResponse,
)
def get_detalle(
    producto_id: int,
    db: Session = Depends(get_db),
):

    try:

        return service.get_detalle(
            db,
            producto_id,
        )

    except ProductoNoEncontradoException as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
@router.patch(
    "/{producto_id}/incrementar-stock",
    response_model=StockResponse,
)
async def incrementar_stock(
    producto_id: int,
    db: Session = Depends(get_db),
):

    try:

        return await service.incrementar_stock(
            db,
            producto_id,
        )

    except ProductoNoEncontradoException as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

@router.get(
    "/{codigo_producto_id}/editar-completo",
    response_model=ProductoCompletoEditarResponse,
)
def get_editar_completo(
    codigo_producto_id: int,
    db: Session = Depends(get_db),
):

    try:

        return service.get_editar_completo(
            db,
            codigo_producto_id,
        )

    except ProductoNoEncontradoException as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


# ----------------------------------------------------------
# PUT EDITAR COMPLETO
# ----------------------------------------------------------

@router.put(
    "/{codigo_producto_id}/editar-completo",
    response_model=ProductoCompletoResponse,
)
def update_completo(
    codigo_producto_id: int,
    data: ProductoCompletoUpdate,
    db: Session = Depends(get_db),
):

    try:

        return service.update_completo(
            db,
            codigo_producto_id,
            data,
        )

    except (
        MarcaNoEncontradaException,
        TipoCalzadoNoEncontradoException,
        MaterialNoEncontradoException,
        ColorNoEncontradoException,
        TallaNoEncontradaException,
        CodigoProductoYaExisteException,
        ProductoYaExisteException,
    ) as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    except ProductoNoEncontradoException as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
@router.patch(
    "/{producto_id}/decrementar-stock",
    response_model=StockResponse,
)
async def decrementar_stock(
    producto_id: int,
    db: Session = Depends(get_db),
):

    try:

        return await service.decrementar_stock(
            db,
            producto_id,
        )

    except ProductoNoEncontradoException as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    except StockInsuficienteException as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
@router.websocket("/ws")
async def websocket_stock(
    websocket: WebSocket,
):
    await manager.connect(websocket)

    try:

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(websocket)
@router.patch(
    '/{codigo_producto_id}/color/{color_id}/desactivar',
    status_code=status.HTTP_200_OK,
)
def desactivar_color(
    codigo_producto_id: int,
    color_id: int,
    db: Session = Depends(get_db),
):
    return service.desactivar_color(db, codigo_producto_id, color_id)

@router.patch(
    '/{codigo_producto_id}/color/{color_id}/recuperar',
    status_code=status.HTTP_200_OK,
)
def recuperar_color(
    codigo_producto_id: int,
    color_id: int,
    db: Session = Depends(get_db),
):
    return service.recuperar_color(db, codigo_producto_id, color_id)

@router.put(
    '/{codigo_producto_id}/color/{color_id}',
    status_code=status.HTTP_200_OK,
)
def update_por_color(
    codigo_producto_id: int,
    color_id: int,
    data: ProductoColorUpdate,
    db: Session = Depends(get_db),
):
    return service.update_por_color(db, codigo_producto_id, color_id, data)
