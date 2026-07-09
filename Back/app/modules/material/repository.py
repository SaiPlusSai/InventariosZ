from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.material.models import Material


class MaterialRepository:
    """
    Repositorio encargado exclusivamente del acceso
    a la base de datos.
    """

    
    def get_papelera(self, db: Session) -> list[Material]:
        statement = (
            select(Material)
            .where(Material.estado == False)
        )
        return db.scalars(statement).all()

    def get_all(self, db: Session) -> list[Material]:
        statement = (
            select(Material)
            .where(Material.estado == True)
            .order_by(Material.nombre.asc())
        )

        return db.scalars(statement).all()

    def get_by_id(
        self,
        db: Session,
        material_id: int,
    ) -> Material | None:

        statement = (
            select(Material)
            .where(Material.estado == True)
            .where(Material.id == material_id)
        )

        return db.scalar(statement)

    def get_by_nombre(
        self,
        db: Session,
        nombre: str,
    ) -> Material | None:

        statement = (
            select(Material)
            .where(Material.estado == True)
            .where(Material.nombre == nombre)
        )

        return db.scalar(statement)
        
    def get_by_nombre_any_state(
        self,
        db: Session,
        nombre: str,
    ) -> Material | None:

        statement = (
            select(Material)
            .where(Material.nombre == nombre)
        )

        return db.scalar(statement)

    
    def get_by_id_papelera(
        self,
        db: Session,
        material_id: int, # or just id
    ) -> Material | None:
        statement = (
            select(Material)
            .where(Material.estado == False)
            .where(Material.id == material_id)
        )
        return db.scalar(statement)

    def create(
        self,
        db: Session,
        material: Material,
    ) -> Material:

        db.add(material)
        db.commit()
        db.refresh(material)

        return material

    def update(
        self,
        db: Session,
        material: Material,
    ) -> Material:

        db.commit()
        db.refresh(material)

        return material

    def delete(
        self,
        db: Session,
        material: Material,
    ) -> None:

        db.delete(material)
        db.commit()

    def get_dependencias(self, db: Session, id: int) -> dict:
        # Dummy implementation, can be refined manually if needed
        return {"dependencias": {}}
