from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.modules.material.exceptions import (
    MaterialNoEncontradoException,
    MaterialYaExisteException,
)
from app.modules.material.schemas import (
    MaterialCreate,
    MaterialResponse,
    MaterialUpdate,
)
from app.modules.material.service import MaterialService


router = APIRouter(
    prefix="/materiales",
    tags=["Materiales"],
)

service = MaterialService()


@router.get(
    "/",
    response_model=list[MaterialResponse],
)
def get_all(
    db: Session = Depends(get_db),
):

    return service.get_all(db)



@router.get(
    "/papelera",
    response_model=list, # using list for simplicity since schemas vary slightly
)
def get_papelera(db: Session = Depends(get_db)):
    return service.get_papelera(db)

@router.get(
    "/{material_id}/dependencias",
)
def get_dependencias(material_id: int, db: Session = Depends(get_db)):
    return service.get_dependencias(db, material_id)

@router.patch(
    "/{material_id}/desactivar",
)
def desactivar(material_id: int, db: Session = Depends(get_db)):
    return service.desactivar(db, material_id)

@router.patch(
    "/{material_id}/recuperar",
)
def recuperar(material_id: int, db: Session = Depends(get_db)):
    return service.recuperar(db, material_id)

@router.get(
    "/{material_id}",
    response_model=MaterialResponse,
)
def get_by_id(
    material_id: int,
    db: Session = Depends(get_db),
):

    material = service.get_by_id(
        db,
        material_id,
    )

    if material is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material no encontrado.",
        )

    return material


@router.post(
    "/",
    response_model=MaterialResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: MaterialCreate,
    db: Session = Depends(get_db),
):

    try:

        return service.create(
            db,
            data,
        )

    except MaterialYaExisteException as e:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )


@router.put(
    "/{material_id}",
    response_model=MaterialResponse,
)
def update(
    material_id: int,
    data: MaterialUpdate,
    db: Session = Depends(get_db),
):

    try:

        return service.update(
            db,
            material_id,
            data,
        )

    except MaterialNoEncontradoException as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete(
    "/{material_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    material_id: int,
    db: Session = Depends(get_db),
):

    try:

        service.delete(
            db,
            material_id,
        )

    except MaterialNoEncontradoException as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
