from fastapi import HTTPException, status

class StockInsuficienteException(HTTPException):
    def __init__(self, stock_actual: int, cantidad_solicitada: int):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Stock insuficiente. Stock actual: {stock_actual}, cantidad solicitada: {cantidad_solicitada}"
        )

class MovimientoInvalidoException(HTTPException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )
