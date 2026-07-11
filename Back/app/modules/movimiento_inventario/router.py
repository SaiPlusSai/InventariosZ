from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.movimiento_inventario.schemas import MovimientoCreate, MovimientoResponse
from app.modules.movimiento_inventario.service import movimiento_service

router = APIRouter(prefix="/movimientos", tags=["Movimientos de Inventario"])

@router.post("/", response_model=MovimientoResponse, status_code=201)
def registrar_movimiento(
    request: MovimientoCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Registra un movimiento en el Kardex y actualiza atómicamente el stock del producto.
    """
    # TODO: Inyectar usuario actual cuando exista el módulo de auth
    usuario_id = request.usuario_id 
    return movimiento_service.registrar_movimiento(db=db, request=request, background_tasks=background_tasks)

@router.get("/producto/{producto_id}")
def obtener_kardex(
    producto_id: int, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    Obtiene el historial de movimientos (Kardex) de un producto específico.
    """
    return movimiento_service.obtener_kardex_producto(db=db, producto_id=producto_id, skip=skip, limit=limit)
