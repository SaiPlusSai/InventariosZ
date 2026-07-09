from app.core.exceptions import RegistroActivoNoPuedeEliminarseException
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

    
    def get_papelera(self, db: Session) -> list[TipoCalzado]:
        return self.repository.get_papelera(db)

    def get_dependencias(self, db: Session, id: int) -> dict:
        return self.repository.get_dependencias(db, id)

    def desactivar(self, db: Session, id: int):
        item = self.repository.get_by_id(db, id)
        if item:
            item.estado = False
            from datetime import datetime
            item.deleted_at = datetime.now()
            db.commit()
            db.refresh(item)
        return item

    def recuperar(self, db: Session, id: int):
        item = self.repository.get_by_id_papelera(db, id)
        if item:
            item.estado = True
            item.deleted_at = None
            db.commit()
            db.refresh(item)
        return item

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

        tipo_existente = self.repository.get_by_nombre_any_state(
            db,
            data.nombre,
        )

        if tipo_existente:
            if tipo_existente.estado:
                raise TipoCalzadoYaExisteException(TIPO_CALZADO_YA_EXISTE)
            else:
                from app.core.exceptions import RegistroEnPapeleraException
                raise RegistroEnPapeleraException(
                    message=f"El tipo de calzado '{data.nombre}' se encuentra en la papelera.",
                    id_registro=tipo_existente.id,
                    tipo_registro="tipo_calzado"
                )

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
            tipo_calzado = self.repository.get_by_id_papelera(db, tipo_calzado_id if 'tipo_calzado_id' in locals() else id)

        if not tipo_calzado:
            raise TipoCalzadoNoEncontradoException(
                TIPO_CALZADO_NO_EXISTE
            )

        if locals().get('item') and getattr(locals()['item'], 'estado', False) or (locals().get('tipo_calzado') and getattr(locals().get('tipo_calzado'), 'estado', False)):
            raise RegistroActivoNoPuedeEliminarseException('No se puede eliminar físicamente un registro activo. Envíelo a la papelera primero.')
        if tipo_calzado.estado == True:
            raise RegistroActivoNoPuedeEliminarseException('No se puede eliminar un registro activo.')

        self.repository.delete(
            db,
            tipo_calzado,
        )
