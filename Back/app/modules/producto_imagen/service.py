from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.modules.producto.constants import PRODUCTO_NO_EXISTE
from app.modules.producto.exceptions import ProductoNoEncontradoException
from app.modules.producto.repository import ProductoRepository
from app.modules.producto_imagen.constants import PRODUCTO_IMAGEN_NO_EXISTE
from app.modules.producto_imagen.exceptions import ProductoImagenNoEncontradaException
from app.modules.producto_imagen.models import ProductoImagen
from app.modules.producto_imagen.repository import ProductoImagenRepository
from app.modules.storage.service import storage_service

class ProductoImagenService:

    def __init__(self):
        self.repository = ProductoImagenRepository()
        self.producto_repository = ProductoRepository()
        self.storage_service = storage_service

    def get_all(self, db: Session) -> list[ProductoImagen]:
        return self.repository.get_all(db)

    def get_by_id(self, db: Session, producto_imagen_id: int) -> ProductoImagen | None:
        return self.repository.get_by_id(db, producto_imagen_id)

    def get_by_producto_id(self, db: Session, producto_id: int) -> list[ProductoImagen]:
        if not self.producto_repository.get_by_id(db, producto_id):
            raise ProductoNoEncontradoException(PRODUCTO_NO_EXISTE)
        return self.repository.get_by_producto_id(db, producto_id)

    async def create(
        self,
        db: Session,
        producto_id: int,
        archivo: UploadFile,
        es_principal: bool = False,
        orden: int = 1,
    ) -> ProductoImagen:

        if not self.producto_repository.get_by_id(db, producto_id):
            raise ProductoNoEncontradoException(PRODUCTO_NO_EXISTE)

        # Sube archivo a Supabase Storage
        resultado_storage = await self.storage_service.subir_archivo(
            producto_id=producto_id,
            archivo=archivo
        )

        try:
            if es_principal:
                self.repository.unset_principal_by_producto(db, producto_id)

            producto_imagen = ProductoImagen(
                producto_id=producto_id,
                bucket=self.storage_service.bucket,
                ruta=resultado_storage["url_publica"],
                nombre_archivo=resultado_storage["nombre_original"],
                es_principal=es_principal,
                orden=orden,
            )

            return self.repository.create(db, producto_imagen)
        except Exception as e:
            # Compensacion: Eliminar el archivo de storage si la BD falla
            self.storage_service.eliminar_archivo(resultado_storage["ruta"])
            raise e

    async def update(
        self,
        db: Session,
        producto_imagen_id: int,
        archivo: UploadFile,
    ) -> ProductoImagen:

        producto_imagen = self.repository.get_by_id(db, producto_imagen_id)

        if not producto_imagen:
            raise ProductoImagenNoEncontradaException(PRODUCTO_IMAGEN_NO_EXISTE)

        resultado_storage = await self.storage_service.reemplazar_archivo(
            producto_id=producto_imagen.producto_id,
            ruta_actual=producto_imagen.ruta,
            nuevo_archivo=archivo
        )

        producto_imagen.ruta = resultado_storage["url_publica"]
        producto_imagen.nombre_archivo = resultado_storage["nombre_original"]

        return self.repository.update(db, producto_imagen)

    def set_principal(
        self,
        db: Session,
        producto_imagen_id: int,
    ) -> ProductoImagen:

        producto_imagen = self.repository.get_by_id(db, producto_imagen_id)

        if not producto_imagen:
            raise ProductoImagenNoEncontradaException(PRODUCTO_IMAGEN_NO_EXISTE)

        self.repository.unset_principal_by_producto(
            db,
            producto_imagen.producto_id,
            exclude_id=producto_imagen.id,
        )

        producto_imagen.es_principal = True
        return self.repository.update(db, producto_imagen)

    def delete(
        self,
        db: Session,
        producto_imagen_id: int,
    ) -> None:

        producto_imagen = self.repository.get_by_id(db, producto_imagen_id)

        if not producto_imagen:
            raise ProductoImagenNoEncontradaException(PRODUCTO_IMAGEN_NO_EXISTE)

        ruta = producto_imagen.ruta

        # Primero borrar en BD
        self.repository.delete(db, producto_imagen)

        # Si DB es exitosa, se borra de Supabase
        self.storage_service.eliminar_archivo(ruta)

    def update_orden(
        self,
        db: Session,
        imagenes_datos: list[dict],
    ) -> None:
        self.repository.update_orden(db, imagenes_datos)
