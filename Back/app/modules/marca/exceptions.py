class MarcaException(Exception):
    """Excepción base del módulo Marca."""


class MarcaYaExisteException(MarcaException):
    """La marca ya existe."""


class MarcaNoEncontradaException(MarcaException):
    """La marca no fue encontrada."""