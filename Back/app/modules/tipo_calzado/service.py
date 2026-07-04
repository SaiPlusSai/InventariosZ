from sqlalchemy.orm import Session

from app.modules.tipo_calzado.constants import (
    TIPO_CALZADO_NO_EXISTE,
    TIPO_CALZADO_YA_EXISTE,
)
from app.modules.tipo_calzado.exceptions import (
    TipoCalzadoNoEncontradoException,
    TipoCalzadoYaExisteException,
)
from app.modules.tipo_calzado.models import TipoCalzado
from app.modules.tipo_calzado.repository import TipoCalzadoRepository
from app.modules.tipo_calzado.schemas import (
    TipoCalzadoCreate,
    TipoCalzadoUpdate,
)


class TipoCalzadoService:

    def __init__(self):
        self.repository = TipoCalzadoRepository()

    def get_all(
        self,
        db: Session,
    ) -> list[TipoCalzado]:

        return self.repository.get_all(db)

    def get_by_id(
        self,
        db: Session,
        tipo_calzado_id: int,
    ) -> TipoCalzado | None:

        return self.repository.get_by_id(db, tipo_calzado_id)

    def create(
        self,
        db: Session,
        data: TipoCalzadoCreate,
    ) -> TipoCalzado:

        tipo_calzado_existente = self.repository.get_by_nombre(
            db,
            data.nombre,
        )

        if tipo_calzado_existente:
            raise TipoCalzadoYaExisteException(TIPO_CALZADO_YA_EXISTE)

        nuevo_tipo_calzado = TipoCalzado(
            nombre=data.nombre,
            descripcion=data.descripcion,
        )

        return self.repository.create(
            db,
            nuevo_tipo_calzado,
        )

    def update(
        self,
        db: Session,
        tipo_calzado_id: int,
        data: TipoCalzadoUpdate,
    ) -> TipoCalzado:

        tipo_calzado = self.repository.get_by_id(
            db,
            tipo_calzado_id,
        )

        if not tipo_calzado:
            raise TipoCalzadoNoEncontradoException(TIPO_CALZADO_NO_EXISTE)

        if data.nombre is not None:
            tipo_calzado.nombre = data.nombre

        if data.descripcion is not None:
            tipo_calzado.descripcion = data.descripcion

        if data.estado is not None:
            tipo_calzado.estado = data.estado

        return self.repository.update(
            db,
            tipo_calzado,
        )

    def delete(
        self,
        db: Session,
        tipo_calzado_id: int,
    ) -> None:

        tipo_calzado = self.repository.get_by_id(
            db,
            tipo_calzado_id,
        )

        if not tipo_calzado:
            raise TipoCalzadoNoEncontradoException(
                TIPO_CALZADO_NO_EXISTE
            )

        self.repository.delete(
            db,
            tipo_calzado,
        )
