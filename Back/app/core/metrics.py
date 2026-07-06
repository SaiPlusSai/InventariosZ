import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy import event
from sqlalchemy.engine import Engine

logger = logging.getLogger("db_profiler")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    formatter = logging.Formatter('%(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

class QueryStats:
    def __init__(self):
        self.count = 0
        self.total_time = 0.0
        self.queries = []

    def reset(self):
        self.count = 0
        self.total_time = 0.0
        self.queries.clear()

# Global thread-local or request-local context is hard with async, 
# so we attach the state to the request state in the middleware, 
# but SQLAlchemy events are global or per-engine.
# A common pattern is using contextvars for the current request stats.
import contextvars

query_stats_var = contextvars.ContextVar("query_stats", default=None)

@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    context._query_start_time = time.perf_counter()

@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total_time = time.perf_counter() - context._query_start_time
    stats = query_stats_var.get()
    if stats is not None:
        stats.count += 1
        stats.total_time += total_time
        # Basic check for duplicate queries (exact same statement and params)
        # Be careful, parameters might not be easily hashable, so just check statement text
        stats.queries.append(statement)

class DBProfilerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        stats = QueryStats()
        token = query_stats_var.set(stats)
        
        start_time = time.perf_counter()
        
        response = await call_next(request)
        
        process_time = time.perf_counter() - start_time
        
        # Detect duplicates
        duplicates = len(stats.queries) - len(set(stats.queries))
        
        # Log stats
        logger.info(f"[{request.method}] {request.url.path} | DB Queries: {stats.count} | Duplicates: {duplicates} | DB Time: {stats.total_time:.4f}s | Total Time: {process_time:.4f}s")
        
        # Inject headers
        response.headers["X-DB-Queries-Count"] = str(stats.count)
        response.headers["X-DB-Time-Seconds"] = f"{stats.total_time:.4f}"
        response.headers["X-Process-Time-Seconds"] = f"{process_time:.4f}"
        
        query_stats_var.reset(token)
        return response
