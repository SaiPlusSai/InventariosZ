from sqlalchemy.orm import Session

from app.modules.color.constants import (
    COLOR_NO_EXISTE,
    COLOR_YA_EXISTE,
)
from app.modules.color.exceptions import (
    ColorNoEncontradoException,
    ColorYaExisteException,
)
from app.modules.color.models import Color
from app.modules.color.repository import ColorRepository
from app.modules.color.schemas import (
    ColorCreate,
    ColorUpdate,
)


class ColorService:

    def __init__(self):
        self.repository = ColorRepository()

    def get_all(
        self,
        db: Session,
    ) -> list[Color]:

        return self.repository.get_all(db)

    def get_by_id(
        self,
        db: Session,
        color_id: int,
    ) -> Color | None:

        return self.repository.get_by_id(db, color_id)

    def create(
        self,
        db: Session,
        data: ColorCreate,
    ) -> Color:

        color_existente = self.repository.get_by_nombre(
            db,
            data.nombre,
        )

        if color_existente:
            raise ColorYaExisteException(COLOR_YA_EXISTE)

        nuevo_color = Color(
            nombre=data.nombre,
            codigo_hex=data.codigo_hex,
        )

        return self.repository.create(
            db,
            nuevo_color,
        )

    def update(
        self,
        db: Session,
        color_id: int,
        data: ColorUpdate,
    ) -> Color:

        color = self.repository.get_by_id(
            db,
            color_id,
        )

        if not color:
            raise ColorNoEncontradoException(COLOR_NO_EXISTE)

        if data.nombre is not None:
            color.nombre = data.nombre

        if data.codigo_hex is not None:
            color.codigo_hex = data.codigo_hex

        if data.estado is not None:
            color.estado = data.estado

        return self.repository.update(
            db,
            color,
        )

    def delete(
        self,
        db: Session,
        color_id: int,
    ) -> None:

        color = self.repository.get_by_id(
            db,
            color_id,
        )

        if not color:
            raise ColorNoEncontradoException(
                COLOR_NO_EXISTE
            )

        self.repository.delete(
            db,
            color,
        )
