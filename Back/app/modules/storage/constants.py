"""
Constantes del módulo Storage.
"""

# ==========================================
# Tamaño máximo de archivo (20 MB)
# ==========================================

MAX_FILE_SIZE = 20 * 1024 * 1024

# ==========================================
# Extensiones permitidas
# ==========================================

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".bmp",
    ".tif",
    ".tiff",
    ".svg",
    ".avif",
    ".heic",
    ".heif",
}

# ==========================================
# MIME Types permitidos
# ==========================================

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/svg+xml",
    "image/avif",
    "image/heic",
    "image/heif",
}

# ==========================================
# Nombre del bucket
# ==========================================

DEFAULT_BUCKET = "productos"

# ==========================================
# Carpetas
# ==========================================

PRODUCT_FOLDER_PREFIX = "producto"

# ==========================================
# Longitud máxima del nombre del archivo
# ==========================================

MAX_FILENAME_LENGTH = 255

# ==========================================
# Mensajes
# ==========================================

ERROR_FILE_TOO_LARGE = (
    f"El archivo supera el tamaño máximo permitido de {MAX_FILE_SIZE // (1024 * 1024)} MB."
)

ERROR_INVALID_EXTENSION = (
    "La extensión del archivo no está permitida."
)

ERROR_INVALID_CONTENT_TYPE = (
    "El tipo de archivo no está permitido."
)

ERROR_UPLOAD = (
    "Ocurrió un error al subir el archivo a Supabase Storage."
)

ERROR_DELETE = (
    "Ocurrió un error al eliminar el archivo de Supabase Storage."
)

ERROR_FILE_NOT_FOUND = (
    "No se encontró el archivo solicitado."
)

ERROR_EMPTY_FILE = (
    "El archivo recibido está vacío."
)

ERROR_INVALID_FILENAME = (
    "El nombre del archivo es inválido."
)