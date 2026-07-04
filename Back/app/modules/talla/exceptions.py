class TallaException(Exception):
    """Excepcion base del modulo Talla."""


class TallaYaExisteException(TallaException):
    """La talla ya existe."""


class TallaNoEncontradaException(TallaException):
    """La talla no fue encontrada."""
