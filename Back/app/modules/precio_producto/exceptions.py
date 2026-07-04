class PrecioProductoException(Exception):
    """Excepcion base del modulo PrecioProducto."""


class PrecioProductoNoEncontradoException(PrecioProductoException):
    """El precio del producto no fue encontrado."""
