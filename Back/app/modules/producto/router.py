from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.modules.producto.schemas import (
    ProductoCreate,
    ProductoResponse,
    ProductoUpdate,
)

from app.modules.producto.service import ProductoService

from app.modules.producto.exceptions import (
    ProductoNoEncontradoException,
    ProductoYaExisteException,
)

from app.modules.codigo_producto.exceptions import (
    CodigoProductoNoEncontradoException,
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

router = APIRouter(
    prefix="/productos",
    tags=["Productos"],
)

service = ProductoService()


@router.get(
    "/",
    response_model=list[ProductoResponse],
)
def get_all(
    db: Session = Depends(get_db),
):
    return service.get_all(db)


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