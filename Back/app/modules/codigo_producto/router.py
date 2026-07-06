from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.modules.codigo_producto.schemas import (
    CodigoProductoCreate,
    CodigoProductoResponse,
    CodigoProductoUpdate,
)

from app.modules.codigo_producto.service import CodigoProductoService

from app.modules.codigo_producto.exceptions import (
    CodigoProductoNoEncontradoException,
    CodigoProductoYaExisteException,
)

from app.modules.marca.exceptions import (
    MarcaNoEncontradaException,
)

router = APIRouter(
    prefix="/codigos-producto",
    tags=["Codigos Producto"],
)

service = CodigoProductoService()


@router.get("/", response_model=list[CodigoProductoResponse])
def get_all(db: Session = Depends(get_db)):
    return service.get_all(db)

@router.get(
    "/papelera",
    response_model=list[CodigoProductoResponse],
)
def get_papelera(db: Session = Depends(get_db)):
    return service.get_papelera(db)

@router.get(
    "/{codigo_producto_id}/dependencias",
)
def get_dependencias(codigo_producto_id: int, db: Session = Depends(get_db)):
    return service.get_dependencias(db, codigo_producto_id)


@router.get("/{codigo_producto_id}", response_model=CodigoProductoResponse)
def get_by_id(
    codigo_producto_id: int,
    db: Session = Depends(get_db),
):
    codigo = service.get_by_id(db, codigo_producto_id)

    if codigo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Código de producto no encontrado.",
        )

    return codigo


@router.post(
    "/",
    response_model=CodigoProductoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: CodigoProductoCreate,
    db: Session = Depends(get_db),
):
    try:
        return service.create(db, data)

    except MarcaNoEncontradaException as e:
        raise HTTPException(status_code=404, detail=str(e))

    except CodigoProductoYaExisteException as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.put(
    "/{codigo_producto_id}",
    response_model=CodigoProductoResponse,
)
def update(
    codigo_producto_id: int,
    data: CodigoProductoUpdate,
    db: Session = Depends(get_db),
):
    try:
        return service.update(
            db,
            codigo_producto_id,
            data,
        )

    except MarcaNoEncontradaException as e:
        raise HTTPException(status_code=404, detail=str(e))

    except CodigoProductoNoEncontradoException as e:
        raise HTTPException(status_code=404, detail=str(e))

    except CodigoProductoYaExisteException as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.delete(
    "/{codigo_producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    codigo_producto_id: int,
    db: Session = Depends(get_db),
):
    try:
        service.delete(
            db,
            codigo_producto_id,
        )

    except CodigoProductoNoEncontradoException as e:
        raise HTTPException(status_code=404, detail=str(e))
@router.patch(
    "/{codigo_producto_id}/desactivar",
    response_model=CodigoProductoResponse,
)
def desactivar(codigo_producto_id: int, db: Session = Depends(get_db)):
    return service.desactivar(db, codigo_producto_id)

@router.patch(
    "/{codigo_producto_id}/recuperar",
    response_model=CodigoProductoResponse,
)
def recuperar(codigo_producto_id: int, db: Session = Depends(get_db)):
    return service.recuperar(db, codigo_producto_id)
