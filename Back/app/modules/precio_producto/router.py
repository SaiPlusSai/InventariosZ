from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.precio_producto.exceptions import (
    PrecioProductoNoEncontradoException,
)
from app.modules.precio_producto.schemas import (
    PrecioProductoCreate,
    PrecioProductoResponse,
    PrecioProductoUpdate,
)
from app.modules.precio_producto.service import PrecioProductoService
from app.modules.producto.exceptions import ProductoNoEncontradoException


router = APIRouter(
    prefix="/precios-producto",
    tags=["Precios Producto"],
)

service = PrecioProductoService()


@router.get(
    "/",
    response_model=list[PrecioProductoResponse],
)
def get_all(
    db: Session = Depends(get_db),
):
    return service.get_all(db)


@router.get(
    "/producto/{producto_id}",
    response_model=list[PrecioProductoResponse],
)
def get_by_producto_id(
    producto_id: int,
    db: Session = Depends(get_db),
):
    try:
        return service.get_by_producto_id(
            db,
            producto_id,
        )

    except ProductoNoEncontradoException as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/{precio_producto_id}",
    response_model=PrecioProductoResponse,
)
def get_by_id(
    precio_producto_id: int,
    db: Session = Depends(get_db),
):

    precio_producto = service.get_by_id(
        db,
        precio_producto_id,
    )

    if precio_producto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Precio de producto no encontrado.",
        )

    return precio_producto


@router.post(
    "/",
    response_model=PrecioProductoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: PrecioProductoCreate,
    db: Session = Depends(get_db),
):
    try:
        return service.create(
            db,
            data,
        )

    except ProductoNoEncontradoException as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put(
    "/{precio_producto_id}",
    response_model=PrecioProductoResponse,
)
def update(
    precio_producto_id: int,
    data: PrecioProductoUpdate,
    db: Session = Depends(get_db),
):
    try:
        return service.update(
            db,
            precio_producto_id,
            data,
        )

    except ProductoNoEncontradoException as e:
        raise HTTPException(status_code=404, detail=str(e))

    except PrecioProductoNoEncontradoException as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete(
    "/{precio_producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    precio_producto_id: int,
    db: Session = Depends(get_db),
):
    try:
        service.delete(
            db,
            precio_producto_id,
        )

    except PrecioProductoNoEncontradoException as e:
        raise HTTPException(status_code=404, detail=str(e))
