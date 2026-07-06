class CoreException(Exception):
    """Excepción base de la aplicación."""
    pass

class RegistroNoEncontradoException(CoreException):
    """El registro no fue encontrado."""
    pass

class RegistroYaExisteException(CoreException):
    """El registro ya existe."""
    pass

class RegistroActivoNoPuedeEliminarseException(CoreException):
    """No se puede eliminar físicamente un registro que no está en la papelera."""
    pass

class RegistroYaEliminadoException(CoreException):
    """El registro ya ha sido enviado a la papelera (eliminado lógico)."""
    pass

class RegistroNoEstaEnPapeleraException(CoreException):
    """El registro no se encuentra en la papelera."""
    pass
