from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.marca.models import Marca


class MarcaRepository:
    """
    Repositorio encargado exclusivamente del acceso
    a la base de datos.
    """

    
    def get_papelera(self, db: Session) -> list[Marca]:
        statement = (
            select(Marca)
            .where(Marca.estado == False)
        )
        return db.scalars(statement).all()

    def get_all(self, db: Session) -> list[Marca]:
        statement = (
            select(Marca)
            .where(Marca.estado == True)
            .order_by(Marca.nombre.asc())
        )

        return db.scalars(statement).all()

    def get_by_id(
        self,
        db: Session,
        marca_id: int,
    ) -> Marca | None:

        statement = (
            select(Marca)
            .where(Marca.estado == True)
            .where(Marca.id == marca_id)
        )

        return db.scalar(statement)

    def get_by_nombre(
        self,
        db: Session,
        nombre: str,
    ) -> Marca | None:

        statement = (
            select(Marca)
            .where(Marca.estado == True)
            .where(Marca.nombre == nombre)
        )

        return db.scalar(statement)

    def create(
        self,
        db: Session,
        marca: Marca,
    ) -> Marca:

        db.add(marca)
        db.commit()
        db.refresh(marca)

        return marca

    def update(
        self,
        db: Session,
        marca: Marca,
    ) -> Marca:

        db.commit()
        db.refresh(marca)

        return marca

    def delete(
        self,
        db: Session,
        marca: Marca,
    ) -> None:

        db.delete(marca)
        db.commit()
    def get_dependencias(self, db: Session, id: int) -> dict:
        # Dummy implementation, can be refined manually if needed
        return {"dependencias": {}}
