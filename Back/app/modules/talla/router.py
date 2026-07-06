from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.modules.talla.exceptions import (
    TallaNoEncontradaException,
    TallaYaExisteException,
)
from app.modules.talla.schemas import (
    TallaCreate,
    TallaResponse,
    TallaUpdate,
)
from app.modules.talla.service import TallaService


router = APIRouter(
    prefix="/tallas",
    tags=["Tallas"],
)

service = TallaService()


@router.get(
    "/",
    response_model=list[TallaResponse],
)
def get_all(
    db: Session = Depends(get_db),
):

    return service.get_all(db)



@router.get(
    "/papelera",
    response_model=list[TallaResponse],
)
def get_papelera(db: Session = Depends(get_db)):
    return service.get_papelera(db)

@router.get(
    "/{talla_id}/dependencias",
)
def get_dependencias(talla_id: int, db: Session = Depends(get_db)):
    return service.get_dependencias(db, talla_id)

@router.patch(
    "/{talla_id}/desactivar",
    response_model=TallaResponse,
)
def desactivar(talla_id: int, db: Session = Depends(get_db)):
    return service.desactivar(db, talla_id)

@router.patch(
    "/{talla_id}/recuperar",
    response_model=TallaResponse,
)
def recuperar(talla_id: int, db: Session = Depends(get_db)):
    return service.recuperar(db, talla_id)

@router.get(
    "/{talla_id}",
    response_model=TallaResponse,
)
def get_by_id(
    talla_id: int,
    db: Session = Depends(get_db),
):

    talla = service.get_by_id(
        db,
        talla_id,
    )

    if talla is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Talla no encontrada.",
        )

    return talla


@router.post(
    "/",
    response_model=TallaResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: TallaCreate,
    db: Session = Depends(get_db),
):

    try:

        return service.create(
            db,
            data,
        )

    except TallaYaExisteException as e:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )


@router.put(
    "/{talla_id}",
    response_model=TallaResponse,
)
def update(
    talla_id: int,
    data: TallaUpdate,
    db: Session = Depends(get_db),
):

    try:

        return service.update(
            db,
            talla_id,
            data,
        )

    except TallaNoEncontradaException as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete(
    "/{talla_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    talla_id: int,
    db: Session = Depends(get_db),
):

    try:

        service.delete(
            db,
            talla_id,
        )

    except TallaNoEncontradaException as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
