from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.talla.models import Talla


class TallaRepository:
    """
    Repositorio encargado exclusivamente del acceso
    a la base de datos.
    """

    def get_all(self, db: Session) -> list[Talla]:
        statement = (
            select(Talla)
            .order_by(Talla.orden.asc(), Talla.nombre.asc())
        )

        return db.scalars(statement).all()

    def get_by_id(
        self,
        db: Session,
        talla_id: int,
    ) -> Talla | None:

        statement = (
            select(Talla)
            .where(Talla.id == talla_id)
        )

        return db.scalar(statement)

    def get_by_nombre(
        self,
        db: Session,
        nombre: str,
    ) -> Talla | None:

        statement = (
            select(Talla)
            .where(Talla.nombre == nombre)
        )

        return db.scalar(statement)

    def create(
        self,
        db: Session,
        talla: Talla,
    ) -> Talla:

        db.add(talla)
        db.commit()
        db.refresh(talla)

        return talla

    def update(
        self,
        db: Session,
        talla: Talla,
    ) -> Talla:

        db.commit()
        db.refresh(talla)

        return talla

    def delete(
        self,
        db: Session,
        talla: Talla,
    ) -> None:

        db.delete(talla)
        db.commit()
