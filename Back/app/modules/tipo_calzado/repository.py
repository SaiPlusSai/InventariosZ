from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.tipo_calzado.models import TipoCalzado


class TipoCalzadoRepository:
    """
    Repositorio encargado exclusivamente del acceso
    a la base de datos.
    """

    
    def get_papelera(self, db: Session) -> list[TipoCalzado]:
        statement = (
            select(TipoCalzado)
            .where(TipoCalzado.estado == False)
        )
        return db.scalars(statement).all()

    def get_all(self, db: Session) -> list[TipoCalzado]:
        statement = (
            select(TipoCalzado)
            .where(TipoCalzado.estado == True)
            .order_by(TipoCalzado.nombre.asc())
        )

        return db.scalars(statement).all()

    def get_by_id(
        self,
        db: Session,
        tipo_calzado_id: int,
    ) -> TipoCalzado | None:

        statement = (
            select(TipoCalzado)
            .where(TipoCalzado.estado == True)
            .where(TipoCalzado.id == tipo_calzado_id)
        )

        return db.scalar(statement)

    def get_by_nombre(
        self,
        db: Session,
        nombre: str,
    ) -> TipoCalzado | None:

        statement = (
            select(TipoCalzado)
            .where(TipoCalzado.estado == True)
            .where(TipoCalzado.nombre == nombre)
        )

        return db.scalar(statement)
        
    def get_by_nombre_any_state(
        self,
        db: Session,
        nombre: str,
    ) -> TipoCalzado | None:

        statement = (
            select(TipoCalzado)
            .where(TipoCalzado.nombre == nombre)
        )

        return db.scalar(statement)

    
    def get_by_id_papelera(
        self,
        db: Session,
        tipo_calzado_id: int, # or just id
    ) -> TipoCalzado | None:
        statement = (
            select(TipoCalzado)
            .where(TipoCalzado.estado == False)
            .where(TipoCalzado.id == tipo_calzado_id)
        )
        return db.scalar(statement)

    def create(
        self,
        db: Session,
        tipo_calzado: TipoCalzado,
    ) -> TipoCalzado:

        db.add(tipo_calzado)
        db.commit()
        db.refresh(tipo_calzado)

        return tipo_calzado

    def update(
        self,
        db: Session,
        tipo_calzado: TipoCalzado,
    ) -> TipoCalzado:

        db.commit()
        db.refresh(tipo_calzado)

        return tipo_calzado

    def delete(
        self,
        db: Session,
        tipo_calzado: TipoCalzado,
    ) -> None:

        db.delete(tipo_calzado)
        db.commit()

    def get_dependencias(self, db: Session, id: int) -> dict:
        # Dummy implementation, can be refined manually if needed
        return {"dependencias": {}}
