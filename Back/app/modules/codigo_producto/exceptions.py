class CodigoProductoException(Exception):
    """Excepción base del módulo CodigoProducto."""


class CodigoProductoYaExisteException(CodigoProductoException):
    """El código ya existe."""


class CodigoProductoNoEncontradoException(CodigoProductoException):
    """El código no fue encontrado."""