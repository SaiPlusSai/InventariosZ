from fastapi import APIRouter
from fastapi import Depends
from fastapi import File
from fastapi import Form
from fastapi import HTTPException
from fastapi import UploadFile
from fastapi import status

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.producto.exceptions import ProductoNoEncontradoException
from app.modules.producto_imagen.exceptions import ProductoImagenNoEncontradaException
from app.modules.producto_imagen.schemas import (
    ProductoImagenResponse,
    ReordenarImagenesRequest,
)
from app.modules.producto_imagen.service import ProductoImagenService


router = APIRouter(
    prefix="/productos-imagenes",
    tags=["Productos Imagenes"],
)

service = ProductoImagenService()


@router.get(
    "/producto/{producto_id}",
    response_model=list[ProductoImagenResponse],
    summary="Listar imágenes",
    description="Obtiene todas las imágenes asociadas a un producto."
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


@router.post(
    "/producto/{producto_id}",
    response_model=ProductoImagenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Subir imagen",
    description="Sube una nueva imagen para un producto específico."
)
async def create(
    producto_id: int,
    archivo: UploadFile = File(...),
    es_principal: bool = Form(False),
    orden: int = Form(1),
    db: Session = Depends(get_db),
):
    try:
        return await service.create(
            db=db,
            producto_id=producto_id,
            archivo=archivo,
            es_principal=es_principal,
            orden=orden
        )
    except ProductoNoEncontradoException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch(
    "/orden",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Reordenar imágenes",
    description="Actualiza el orden de visualización de múltiples imágenes de forma masiva."
)
def reordenar(
    data: ReordenarImagenesRequest,
    db: Session = Depends(get_db),
):
    service.update_orden(
        db,
        [{"id": img.id, "orden": img.orden} for img in data.imagenes]
    )
    return


@router.patch(
    "/{producto_imagen_id}",
    response_model=ProductoImagenResponse,
    summary="Actualizar imagen",
    description="Reemplaza el archivo físico de una imagen existente."
)
async def update(
    producto_imagen_id: int,
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        return await service.update(
            db=db,
            producto_imagen_id=producto_imagen_id,
            archivo=archivo
        )
    except ProductoImagenNoEncontradaException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch(
    "/{producto_imagen_id}/principal",
    response_model=ProductoImagenResponse,
    summary="Cambiar imagen principal",
    description="Marca una imagen como principal y desmarca la anterior en una sola transacción."
)
def set_principal(
    producto_imagen_id: int,
    db: Session = Depends(get_db),
):
    try:
        return service.set_principal(
            db,
            producto_imagen_id,
        )
    except ProductoImagenNoEncontradaException as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete(
    "/{producto_imagen_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar imagen",
    description="Borra la imagen de la base de datos y de Supabase."
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
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
