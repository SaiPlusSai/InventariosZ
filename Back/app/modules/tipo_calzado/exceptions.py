class TipoCalzadoException(Exception):
    """Excepcion base del modulo TipoCalzado."""


class TipoCalzadoYaExisteException(TipoCalzadoException):
    """El tipo de calzado ya existe."""


class TipoCalzadoNoEncontradoException(TipoCalzadoException):
    """El tipo de calzado no fue encontrado."""
