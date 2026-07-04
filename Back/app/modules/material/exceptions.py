class MaterialException(Exception):
    """Excepcion base del modulo Material."""


class MaterialYaExisteException(MaterialException):
    """El material ya existe."""


class MaterialNoEncontradoException(MaterialException):
    """El material no fue encontrado."""
