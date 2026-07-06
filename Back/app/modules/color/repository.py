from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.color.models import Color


class ColorRepository:
    """
    Repositorio encargado exclusivamente del acceso
    a la base de datos.
    """

    
    def get_papelera(self, db: Session) -> list[Color]:
        statement = (
            select(Color)
            .where(Color.estado == False)
        )
        return db.scalars(statement).all()

    def get_all(self, db: Session) -> list[Color]:
        statement = (
            select(Color)
            .where(Color.estado == True)
            .order_by(Color.nombre.asc())
        )

        return db.scalars(statement).all()

    def get_by_id(
        self,
        db: Session,
        color_id: int,
    ) -> Color | None:

        statement = (
            select(Color)
            .where(Color.estado == True)
            .where(Color.id == color_id)
        )

        return db.scalar(statement)

    def get_by_nombre(
        self,
        db: Session,
        nombre: str,
    ) -> Color | None:

        statement = (
            select(Color)
            .where(Color.estado == True)
            .where(Color.nombre == nombre)
        )

        return db.scalar(statement)

    def create(
        self,
        db: Session,
        color: Color,
    ) -> Color:

        db.add(color)
        db.commit()
        db.refresh(color)

        return color

    def update(
        self,
        db: Session,
        color: Color,
    ) -> Color:

        db.commit()
        db.refresh(color)

        return color

    def delete(
        self,
        db: Session,
        color: Color,
    ) -> None:

        db.delete(color)
        db.commit()

    def get_dependencias(self, db: Session, id: int) -> dict:
        # Dummy implementation, can be refined manually if needed
        return {"dependencias": {}}
