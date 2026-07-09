from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback

from app.api.router import api_router
from app.core.config import settings
from app.core.metrics import DBProfilerMiddleware
from app.core.exceptions import ValidacionDatosException

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

# ==========================================
# METRICS & CORS
# ==========================================

app.add_middleware(DBProfilerMiddleware)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# RUTAS
# ==========================================

app.include_router(api_router)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    code = "API_ERROR"
    if exc.status_code == 404:
        code = "RECURSO_NO_ENCONTRADO"
    elif exc.status_code == 409:
        code = "CONFLICTO_DE_DATOS"
    elif exc.status_code == 400:
        code = "PETICION_INVALIDA"
        
    message = exc.detail
    if isinstance(exc.detail, dict):
        message = exc.detail.get("message", "Error en la petición")
        code = exc.detail.get("code", code)

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": code,
                "message": message
            }
        },
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Los datos enviados no cumplen con el formato requerido."
            }
        },
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Internal Server Error: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "Ocurrió un error inesperado. Inténtelo nuevamente."
            }
        },
    )


@app.get("/")
def root():
    return {
        "message": "InventariosZ API"
    }