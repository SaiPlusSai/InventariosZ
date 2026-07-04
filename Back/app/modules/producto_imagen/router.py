from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.producto.exceptions import ProductoNoEncontradoException
from app.modules.producto_imagen.exceptions import (
    ProductoImagenNoEncontradaException,
)
from app.modules.producto_imagen.schemas import (
    ProductoImagenCreate,
    ProductoImagenResponse,
    ProductoImagenUpdate,
)
from app.modules.producto_imagen.service import ProductoImagenService


router = APIRouter(
    prefix="/productos-imagenes",
    tags=["Productos Imagenes"],
)

service = ProductoImagenService()


@router.get(
    "/",
    response_model=list[ProductoImagenResponse],
)
def get_all(
    db: Session = Depends(get_db),
):
    return service.get_all(db)


@router.get(
    "/producto/{producto_id}",
    response_model=list[ProductoImagenResponse],
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
    "/{producto_imagen_id}",
    response_model=ProductoImagenResponse,
)
def get_by_id(
    producto_imagen_id: int,
    db: Session = Depends(get_db),
):

    producto_imagen = service.get_by_id(
        db,
        producto_imagen_id,
    )

    if producto_imagen is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imagen de producto no encontrada.",
        )

    return producto_imagen


@router.post(
    "/",
    response_model=ProductoImagenResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: ProductoImagenCreate,
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
    "/{producto_imagen_id}",
    response_model=ProductoImagenResponse,
)
def update(
    producto_imagen_id: int,
    data: ProductoImagenUpdate,
    db: Session = Depends(get_db),
):
    try:
        return service.update(
            db,
            producto_imagen_id,
            data,
        )

    except ProductoNoEncontradoException as e:
        raise HTTPException(status_code=404, detail=str(e))

    except ProductoImagenNoEncontradaException as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete(
    "/{producto_imagen_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    producto_imagen_id: int,
    db: Session = Depends(get_db),
):
    try:
        service.delete(
            db,
            producto_imagen_id,
        )

    except ProductoImagenNoEncontradaException as e:
        raise HTTPException(status_code=404, detail=str(e))
