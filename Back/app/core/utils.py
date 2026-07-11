from urllib.parse import urljoin
from app.core.config import settings

def api_url(path: str) -> str:
    """
    Construye una URL completa basada en settings.API_BASE_URL.
    """
    base = settings.API_BASE_URL
    if not base.endswith("/"):
        base += "/"
    if path.startswith("/"):
        path = path[1:]
    return urljoin(base, path)

def get_websocket_url(path: str) -> str:
    """
    Construye una URL de WebSocket basada en settings.API_BASE_URL,
    reemplazando http/https por ws/wss.
    """
    base_url = settings.API_BASE_URL
    if base_url.startswith("https://"):
        ws_base = base_url.replace("https://", "wss://", 1)
    elif base_url.startswith("http://"):
        ws_base = base_url.replace("http://", "ws://", 1)
    else:
        ws_base = base_url
        
    if not ws_base.endswith("/"):
        ws_base += "/"
    if path.startswith("/"):
        path = path[1:]
    return urljoin(ws_base, path)
