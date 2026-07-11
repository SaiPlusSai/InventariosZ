from fastapi import UploadFile, File
from fastapi.responses import StreamingResponse
from app.modules.color.schemas import PreviaImportacionResponse, ConfirmarImportacionRequest
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
    "/papelera",
    response_model=list[ColorResponse],
)
def get_papelera(db: Session = Depends(get_db)):
    return service.get_papelera(db)

@router.get(
    "/{color_id}/dependencias",
)
def get_dependencias(color_id: int, db: Session = Depends(get_db)):
    return service.get_dependencias(db, color_id)

@router.patch(
    "/{color_id}/desactivar",
    response_model=ColorResponse,
)
def desactivar(color_id: int, db: Session = Depends(get_db)):
    return service.desactivar(db, color_id)

@router.patch(
    "/{color_id}/recuperar",
    response_model=ColorResponse,
)
def recuperar(color_id: int, db: Session = Depends(get_db)):
    return service.recuperar(db, color_id)

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

@router.get("/exportar/excel")
def exportar_excel(db: Session = Depends(get_db)):
    buffer = service.exportar_excel(db)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=Color_inventario.xlsx"}
    )

@router.get("/importar/plantilla")
def importar_plantilla():
    buffer = service.generar_plantilla_importacion()
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=plantilla_Color.xlsx"}
    )

@router.post("/importar/previa", response_model=PreviaImportacionResponse)
async def previa_importacion(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El archivo debe ser un Excel")
    return await service.previa_importacion(db, file)

@router.post("/importar/confirmar")
def confirmar_importacion(data: ConfirmarImportacionRequest, db: Session = Depends(get_db)):
    try:
        return service.confirmar_importacion(db, data.filas)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
