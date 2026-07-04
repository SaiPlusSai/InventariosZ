class ProductoImagenException(Exception):
    """Excepcion base del modulo ProductoImagen."""


class ProductoImagenNoEncontradaException(ProductoImagenException):
    """La imagen del producto no fue encontrada."""
