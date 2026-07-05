from fastapi import WebSocket
from fastapi import WebSocketDisconnect


class ProductoConnectionManager:

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(
        self,
        websocket: WebSocket,
    ):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(
        self,
        websocket: WebSocket,
    ):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_stock(
        self,
        producto_id: int,
        stock_actual: int,
    ):
        mensaje = {
            "tipo": "stock_actualizado",
            "producto_id": producto_id,
            "stock_actual": stock_actual,
        }

        conexiones_caidas = []

        for conexion in self.active_connections:

            try:
                await conexion.send_json(mensaje)

            except Exception:
                conexiones_caidas.append(conexion)

        for conexion in conexiones_caidas:
            self.disconnect(conexion)


manager = ProductoConnectionManager()