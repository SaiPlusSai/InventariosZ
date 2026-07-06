"""
Utilidades del módulo Storage.
"""

from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.modules.storage.constants import (
    ALLOWED_CONTENT_TYPES,
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE,
    PRODUCT_FOLDER_PREFIX,
    MAX_FILENAME_LENGTH,
    ERROR_EMPTY_FILE,
    ERROR_FILE_TOO_LARGE,
    ERROR_INVALID_CONTENT_TYPE,
    ERROR_INVALID_EXTENSION,
    ERROR_INVALID_FILENAME,
)

from app.modules.storage.exceptions import (
    ArchivoVacioException,
    ArchivoMuyGrandeException,
    ContentTypeNoPermitidoException,
    ExtensionNoPermitidaException,
    NombreArchivoInvalidoException,
)


def obtener_extension(filename: str) -> str:
    """
    Obtiene la extensión del archivo.
    """

    return Path(filename).suffix.lower()


def validar_nombre_archivo(filename: str) -> None:
    """
    Valida el nombre del archivo.
    """

    if not filename:
        raise NombreArchivoInvalidoException(ERROR_INVALID_FILENAME)

    if len(filename) > MAX_FILENAME_LENGTH:
        raise NombreArchivoInvalidoException(ERROR_INVALID_FILENAME)


def validar_extension(filename: str) -> None:
    """
    Valida la extensión.
    """

    extension = obtener_extension(filename)

    if extension not in ALLOWED_EXTENSIONS:
        raise ExtensionNoPermitidaException(
            ERROR_INVALID_EXTENSION
        )


def validar_content_type(content_type: str) -> None:
    """
    Valida el MIME Type.
    """

    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ContentTypeNoPermitidoException(
            ERROR_INVALID_CONTENT_TYPE
        )


async def validar_tamano(file: UploadFile) -> None:
    """
    Valida el tamaño del archivo.
    """

    contenido = await file.read()

    if len(contenido) == 0:
        raise ArchivoVacioException(
            ERROR_EMPTY_FILE
        )

    if len(contenido) > MAX_FILE_SIZE:
        raise ArchivoMuyGrandeException(
            ERROR_FILE_TOO_LARGE
        )

    await file.seek(0)


def generar_nombre_archivo(filename: str) -> str:
    """
    Genera un nombre único.
    """

    extension = obtener_extension(filename)

    return f"{uuid4().hex}{extension}"


def generar_ruta_producto(
    producto_id: int,
    filename: str,
) -> str:
    """
    Genera la ruta dentro del bucket.

    Ejemplo:

    producto_5/xxxxxxxx.webp
    """

    nombre = generar_nombre_archivo(filename)

    return (
        f"{PRODUCT_FOLDER_PREFIX}_{producto_id}"
        f"/{nombre}"
    )


def obtener_nombre_archivo(ruta: str) -> str:
    """
    Devuelve únicamente el nombre del archivo.
    """

    return Path(ruta).name


def obtener_directorio(ruta: str) -> str:
    """
    Devuelve únicamente el directorio.
    """

    return str(Path(ruta).parent)


async def validar_archivo(file: UploadFile) -> None:
    """
    Ejecuta todas las validaciones.
    """

    validar_nombre_archivo(file.filename)

    validar_extension(file.filename)

    validar_content_type(file.content_type)

    await validar_tamano(file)