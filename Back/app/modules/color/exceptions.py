class ColorException(Exception):
    """Excepcion base del modulo Color."""


class ColorYaExisteException(ColorException):
    """El color ya existe."""


class ColorNoEncontradoException(ColorException):
    """El color no fue encontrado."""
