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

class ValidacionDatosException(CoreException):
    """Error de validacion de datos de negocio."""
    pass

class RegistroEnPapeleraException(CoreException):
    def __init__(self, message, id_registro, tipo_registro):
        super().__init__(message)
        self.message = message
        self.id_registro = id_registro
        self.tipo_registro = tipo_registro

class RecuperacionConflictivaException(CoreException):
    """Excepcion para cuando la recuperacion choca con un registro activo."""
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message
