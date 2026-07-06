from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.modules.tipo_calzado.exceptions import (
    TipoCalzadoNoEncontradoException,
    TipoCalzadoYaExisteException,
)
from app.modules.tipo_calzado.schemas import (
    TipoCalzadoCreate,
    TipoCalzadoResponse,
    TipoCalzadoUpdate,
)
from app.modules.tipo_calzado.service import TipoCalzadoService


router = APIRouter(
    prefix="/tipos-calzado",
    tags=["Tipos de calzado"],
)

service = TipoCalzadoService()


@router.get(
    "/",
    response_model=list[TipoCalzadoResponse],
)
def get_all(
    db: Session = Depends(get_db),
):

    return service.get_all(db)



@router.get(
    "/papelera",
    response_model=list[TipoCalzadoResponse],
)
def get_papelera(db: Session = Depends(get_db)):
    return service.get_papelera(db)

@router.get(
    "/{tipo_calzado_id}/dependencias",
)
def get_dependencias(tipo_calzado_id: int, db: Session = Depends(get_db)):
    return service.get_dependencias(db, tipo_calzado_id)

@router.patch(
    "/{tipo_calzado_id}/desactivar",
    response_model=TipoCalzadoResponse,
)
def desactivar(tipo_calzado_id: int, db: Session = Depends(get_db)):
    return service.desactivar(db, tipo_calzado_id)

@router.patch(
    "/{tipo_calzado_id}/recuperar",
    response_model=TipoCalzadoResponse,
)
def recuperar(tipo_calzado_id: int, db: Session = Depends(get_db)):
    return service.recuperar(db, tipo_calzado_id)

@router.get(
    "/{tipo_calzado_id}",
    response_model=TipoCalzadoResponse,
)
def get_by_id(
    tipo_calzado_id: int,
    db: Session = Depends(get_db),
):

    tipo_calzado = service.get_by_id(
        db,
        tipo_calzado_id,
    )

    if tipo_calzado is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tipo de calzado no encontrado.",
        )

    return tipo_calzado


@router.post(
    "/",
    response_model=TipoCalzadoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: TipoCalzadoCreate,
    db: Session = Depends(get_db),
):

    try:

        return service.create(
            db,
            data,
        )

    except TipoCalzadoYaExisteException as e:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )


@router.put(
    "/{tipo_calzado_id}",
    response_model=TipoCalzadoResponse,
)
def update(
    tipo_calzado_id: int,
    data: TipoCalzadoUpdate,
    db: Session = Depends(get_db),
):

    try:

        return service.update(
            db,
            tipo_calzado_id,
            data,
        )

    except TipoCalzadoNoEncontradoException as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete(
    "/{tipo_calzado_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    tipo_calzado_id: int,
    db: Session = Depends(get_db),
):

    try:

        service.delete(
            db,
            tipo_calzado_id,
        )

    except TipoCalzadoNoEncontradoException as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
