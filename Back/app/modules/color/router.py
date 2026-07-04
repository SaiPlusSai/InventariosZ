from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.modules.color.exceptions import (
    ColorNoEncontradoException,
    ColorYaExisteException,
)
from app.modules.color.schemas import (
    ColorCreate,
    ColorResponse,
    ColorUpdate,
)
from app.modules.color.service import ColorService


router = APIRouter(
    prefix="/colores",
    tags=["Colores"],
)

service = ColorService()


@router.get(
    "/",
    response_model=list[ColorResponse],
)
def get_all(
    db: Session = Depends(get_db),
):

    return service.get_all(db)


@router.get(
    "/{color_id}",
    response_model=ColorResponse,
)
def get_by_id(
    color_id: int,
    db: Session = Depends(get_db),
):

    color = service.get_by_id(
        db,
        color_id,
    )

    if color is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Color no encontrado.",
        )

    return color


@router.post(
    "/",
    response_model=ColorResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: ColorCreate,
    db: Session = Depends(get_db),
):

    try:

        return service.create(
            db,
            data,
        )

    except ColorYaExisteException as e:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )


@router.put(
    "/{color_id}",
    response_model=ColorResponse,
)
def update(
    color_id: int,
    data: ColorUpdate,
    db: Session = Depends(get_db),
):

    try:

        return service.update(
            db,
            color_id,
            data,
        )

    except ColorNoEncontradoException as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete(
    "/{color_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    color_id: int,
    db: Session = Depends(get_db),
):

    try:

        service.delete(
            db,
            color_id,
        )

    except ColorNoEncontradoException as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
