from sqlalchemy.orm import Session

from app.modules.talla.constants import (
    TALLA_NO_EXISTE,
    TALLA_YA_EXISTE,
)
from app.modules.talla.exceptions import (
    TallaNoEncontradaException,
    TallaYaExisteException,
)
from app.modules.talla.models import Talla
from app.modules.talla.repository import TallaRepository
from app.modules.talla.schemas import (
    TallaCreate,
    TallaUpdate,
)


class TallaService:

    def __init__(self):
        self.repository = TallaRepository()

    def get_all(
        self,
        db: Session,
    ) -> list[Talla]:

        return self.repository.get_all(db)

    def get_by_id(
        self,
        db: Session,
        talla_id: int,
    ) -> Talla | None:

        return self.repository.get_by_id(db, talla_id)

    def create(
        self,
        db: Session,
        data: TallaCreate,
    ) -> Talla:

        talla_existente = self.repository.get_by_nombre(
            db,
            data.nombre,
        )

        if talla_existente:
            raise TallaYaExisteException(TALLA_YA_EXISTE)

        nueva_talla = Talla(
            nombre=data.nombre,
            orden=data.orden,
        )

        return self.repository.create(
            db,
            nueva_talla,
        )

    def update(
        self,
        db: Session,
        talla_id: int,
        data: TallaUpdate,
    ) -> Talla:

        talla = self.repository.get_by_id(
            db,
            talla_id,
        )

        if not talla:
            raise TallaNoEncontradaException(TALLA_NO_EXISTE)

        if data.nombre is not None:
            talla.nombre = data.nombre

        if data.orden is not None:
            talla.orden = data.orden

        if data.estado is not None:
            talla.estado = data.estado

        return self.repository.update(
            db,
            talla,
        )

    def delete(
        self,
        db: Session,
        talla_id: int,
    ) -> None:

        talla = self.repository.get_by_id(
            db,
            talla_id,
        )

        if not talla:
            raise TallaNoEncontradaException(
                TALLA_NO_EXISTE
            )

        self.repository.delete(
            db,
            talla,
        )
