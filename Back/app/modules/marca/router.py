from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.modules.marca.constants import (
    MARCA_CREADA,
    MARCA_ACTUALIZADA,
    MARCA_ELIMINADA,
)

from app.modules.marca.exceptions import (
    MarcaNoEncontradaException,
    MarcaYaExisteException,
)

from app.modules.marca.schemas import (
    MarcaCreate,
    MarcaResponse,
    MarcaUpdate,
)

from app.modules.marca.service import MarcaService


router = APIRouter(
    prefix="/marcas",
    tags=["Marcas"],
)

service = MarcaService()


@router.get(
    "/",
    response_model=list[MarcaResponse],
)
def get_all(
    db: Session = Depends(get_db),
):

    return service.get_all(db)


@router.get(
    "/{marca_id}",
    response_model=MarcaResponse,
)
def get_by_id(
    marca_id: int,
    db: Session = Depends(get_db),
):

    marca = service.get_by_id(
        db,
        marca_id,
    )

    if marca is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Marca no encontrada.",
        )

    return marca


@router.post(
    "/",
    response_model=MarcaResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: MarcaCreate,
    db: Session = Depends(get_db),
):

    try:

        return service.create(
            db,
            data,
        )

    except MarcaYaExisteException as e:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )


@router.put(
    "/{marca_id}",
    response_model=MarcaResponse,
)
def update(
    marca_id: int,
    data: MarcaUpdate,
    db: Session = Depends(get_db),
):

    try:

        return service.update(
            db,
            marca_id,
            data,
        )

    except MarcaNoEncontradaException as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete(
    "/{marca_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    marca_id: int,
    db: Session = Depends(get_db),
):

    try:

        service.delete(
            db,
            marca_id,
        )

    except MarcaNoEncontradaException as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )