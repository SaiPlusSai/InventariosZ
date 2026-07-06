from fastapi import UploadFile
from supabase import Client

from app.core.config import settings
from app.modules.storage.cliente import supabase
from app.modules.storage.constants import (
    DEFAULT_BUCKET,
    ERROR_DELETE,
    ERROR_FILE_NOT_FOUND,
    ERROR_UPLOAD,
)
from app.modules.storage.exceptions import (
    ArchivoNoEncontradoException,
    ErrorEliminandoArchivoException,
    ErrorObteniendoUrlException,
    ErrorSubiendoArchivoException,
)
from app.modules.storage.utils import (
    generar_ruta_producto,
    validar_archivo,
)


class StorageService:

    def __init__(
        self,
        client: Client = supabase,
        bucket: str = DEFAULT_BUCKET,
    ):
        self.client = client
        self.bucket = bucket or settings.SUPABASE_BUCKET

    async def subir_archivo(
        self,
        producto_id: int,
        archivo: UploadFile,
    ) -> dict:
        """
        Sube un archivo al bucket.
        """

        await validar_archivo(archivo)

        ruta = generar_ruta_producto(
            producto_id,
            archivo.filename,
        )

        contenido = await archivo.read()

        try:

            self.client.storage.from_(self.bucket).upload(
                path=ruta,
                file=contenido,
                file_options={
                    "content-type": archivo.content_type,
                    "upsert": False,
                },
            )

        except Exception as e:
            raise ErrorSubiendoArchivoException(
                f"{ERROR_UPLOAD} {e}"
            )

        url = self.obtener_url_publica(ruta)

        return {
            "ruta": ruta,
            "url_publica": url,
            "nombre_original": archivo.filename,
            "content_type": archivo.content_type,
            "size": len(contenido),
        }

    def obtener_url_publica(
        self,
        ruta: str,
    ) -> str:
        """
        Obtiene la URL pública.
        """

        try:

            return self.client.storage.from_(
                self.bucket
            ).get_public_url(ruta)

        except Exception as e:

            raise ErrorObteniendoUrlException(
                str(e)
            )

    def eliminar_archivo(
        self,
        ruta: str,
    ) -> None:
        """
        Elimina un archivo.
        """

        try:

            self.client.storage.from_(
                self.bucket
            ).remove([ruta])

        except Exception as e:

            raise ErrorEliminandoArchivoException(
                f"{ERROR_DELETE} {e}"
            )

    async def reemplazar_archivo(
        self,
        producto_id: int,
        ruta_actual: str,
        nuevo_archivo: UploadFile,
    ) -> dict:
        """
        Reemplaza un archivo.
        """

        self.eliminar_archivo(ruta_actual)

        return await self.subir_archivo(
            producto_id,
            nuevo_archivo,
        )

    def existe_archivo(
        self,
        ruta: str,
    ) -> bool:
        """
        Verifica si existe un archivo.
        """

        carpeta = "/".join(ruta.split("/")[:-1])
        nombre = ruta.split("/")[-1]

        try:

            archivos = self.client.storage.from_(
                self.bucket
            ).list(carpeta)

            for archivo in archivos:

                if archivo["name"] == nombre:
                    return True

            return False

        except Exception:

            return False

    def obtener_informacion(
        self,
        ruta: str,
    ) -> dict:
        """
        Obtiene información del archivo.
        """

        carpeta = "/".join(ruta.split("/")[:-1])
        nombre = ruta.split("/")[-1]

        archivos = self.client.storage.from_(
            self.bucket
        ).list(carpeta)

        for archivo in archivos:

            if archivo["name"] == nombre:
                return archivo

        raise ArchivoNoEncontradoException(
            ERROR_FILE_NOT_FOUND
        )


storage_service = StorageService()