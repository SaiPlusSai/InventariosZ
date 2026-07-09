from app.core.exceptions import RegistroActivoNoPuedeEliminarseException
from sqlalchemy.orm import Session

from app.modules.color.constants import (
    COLOR_NO_EXISTE,
    COLOR_YA_EXISTE,
)
from app.modules.color.exceptions import (
    ColorNoEncontradoException,
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

    
    def get_papelera(self, db: Session) -> list[Color]:
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

        color_existente = self.repository.get_by_nombre_any_state(
            db,
            data.nombre,
        )

        if color_existente:
            if color_existente.estado:
                from app.core.exceptions import RegistroYaExisteException
                raise RegistroYaExisteException("El color ya existe.")
            else:
                from app.core.exceptions import RegistroEnPapeleraException
                raise RegistroEnPapeleraException(
                    message=f"El color '{data.nombre}' existe en la Papelera.",
                    id_registro=color_existente.id,
                    tipo_registro="color"
                )

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
            color = self.repository.get_by_id_papelera(db, color_id if 'color_id' in locals() else id)

        if not color:
            raise ColorNoEncontradoException(
                COLOR_NO_EXISTE
            )

        if locals().get('item') and getattr(locals()['item'], 'estado', False) or (locals().get('color') and getattr(locals().get('color'), 'estado', False)):
            raise RegistroActivoNoPuedeEliminarseException('No se puede eliminar físicamente un registro activo. Envíelo a la papelera primero.')
        if color.estado == True:
            raise RegistroActivoNoPuedeEliminarseException('No se puede eliminar un registro activo.')

        self.repository.delete(
            db,
            color,
        )
