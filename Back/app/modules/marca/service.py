from sqlalchemy.orm import Session
from app.modules.marca.constants import (
    MARCA_NO_EXISTE,
    MARCA_YA_EXISTE,
)

from app.modules.marca.exceptions import (
    MarcaNoEncontradaException,
    MarcaYaExisteException,
)
from app.modules.marca.models import Marca
from app.modules.marca.repository import MarcaRepository
from app.modules.marca.schemas import (
    MarcaCreate,
    MarcaUpdate,
)


class MarcaService:

    def __init__(self):
        self.repository = MarcaRepository()

    def get_all(
        self,
        db: Session,
    ) -> list[Marca]:

        return self.repository.get_all(db)

    def get_by_id(
        self,
        db: Session,
        marca_id: int,
    ) -> Marca | None:

        return self.repository.get_by_id(db, marca_id)

    def create(
        self,
        db: Session,
        data: MarcaCreate,
    ) -> Marca:

        marca_existente = self.repository.get_by_nombre(
            db,
            data.nombre,
        )

        if marca_existente:
            raise MarcaYaExisteException(MARCA_YA_EXISTE)

        nueva_marca = Marca(
            nombre=data.nombre,
            descripcion=data.descripcion,
        )

        return self.repository.create(
            db,
            nueva_marca,
        )

    def update(
        self,
        db: Session,
        marca_id: int,
        data: MarcaUpdate,
    ) -> Marca:

        marca = self.repository.get_by_id(
            db,
            marca_id,
        )

        if not marca:
            raise MarcaNoEncontradaException(MARCA_NO_EXISTE)

        if data.nombre is not None:
            marca.nombre = data.nombre

        if data.descripcion is not None:
            marca.descripcion = data.descripcion

        if data.estado is not None:
            marca.estado = data.estado

        return self.repository.update(
            db,
            marca,
        )

    def delete(
        self,
        db: Session,
        marca_id: int,
    ) -> None:

        marca = self.repository.get_by_id(
            db,
            marca_id,
        )

        if not marca:
            raise MarcaNoEncontradaException(MARCA_NO_EXISTE)

        self.repository.delete(
            db,
            marca,
        )