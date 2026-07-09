from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

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

@app.exception_handler(ValidacionDatosException)
async def validacion_datos_exception_handler(request: Request, exc: ValidacionDatosException):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )


@app.get("/")
def root():
    return {
        "message": "InventariosZ API"
    }