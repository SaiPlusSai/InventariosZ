"""
Excepciones del módulo Storage.
"""


class StorageException(Exception):
    """
    Excepción base del módulo Storage.
    """

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class ArchivoNoEncontradoException(StorageException):
    """
    El archivo solicitado no existe.
    """

    pass


class ArchivoMuyGrandeException(StorageException):
    """
    El archivo supera el tamaño máximo permitido.
    """

    pass


class ExtensionNoPermitidaException(StorageException):
    """
    La extensión del archivo no está permitida.
    """

    pass


class ContentTypeNoPermitidoException(StorageException):
    """
    El Content-Type del archivo no está permitido.
    """

    pass


class NombreArchivoInvalidoException(StorageException):
    """
    El nombre del archivo es inválido.
    """

    pass


class ArchivoVacioException(StorageException):
    """
    El archivo recibido está vacío.
    """

    pass


class ErrorSubiendoArchivoException(StorageException):
    """
    Error al subir un archivo a Supabase Storage.
    """

    pass


class ErrorEliminandoArchivoException(StorageException):
    """
    Error al eliminar un archivo de Supabase Storage.
    """

    pass


class ErrorObteniendoUrlException(StorageException):
    """
    Error al obtener la URL pública del archivo.
    """

    pass