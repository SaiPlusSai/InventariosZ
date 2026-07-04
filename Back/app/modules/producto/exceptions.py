class ProductoException(Exception):
    """Excepción base del módulo Producto."""


class ProductoYaExisteException(ProductoException):
    """El producto ya existe."""


class ProductoNoEncontradoException(ProductoException):
    """El producto no fue encontrado."""