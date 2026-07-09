from app.core.exceptions import RegistroActivoNoPuedeEliminarseException
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

    
    def get_papelera(self, db: Session) -> list[Talla]:
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

        talla_existente = self.repository.get_by_nombre_any_state(
            db,
            data.nombre,
        )

        if talla_existente:
            if talla_existente.estado:
                raise TallaYaExisteException(TALLA_YA_EXISTE)
            else:
                from app.core.exceptions import RegistroEnPapeleraException
                raise RegistroEnPapeleraException(
                    message=f"La talla '{data.nombre}' se encuentra en la papelera.",
                    id_registro=talla_existente.id,
                    tipo_registro="talla"
                )

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
            talla = self.repository.get_by_id_papelera(db, talla_id if 'talla_id' in locals() else id)

        if not talla:
            raise TallaNoEncontradaException(
                TALLA_NO_EXISTE
            )

        if locals().get('item') and getattr(locals()['item'], 'estado', False) or (locals().get('talla') and getattr(locals().get('talla'), 'estado', False)):
            raise RegistroActivoNoPuedeEliminarseException('No se puede eliminar físicamente un registro activo. Envíelo a la papelera primero.')
        if talla.estado == True:
            raise RegistroActivoNoPuedeEliminarseException('No se puede eliminar un registro activo.')

        self.repository.delete(
            db,
            talla,
        )
