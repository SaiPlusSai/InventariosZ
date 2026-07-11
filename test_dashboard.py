import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'Back')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.modules.dashboard.repository import dashboard_repository
from app.core.config import settings

# Conectamos a la BD usando la URL de configuracion o una por defecto
DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()
try:
    stats = dashboard_repository.get_stats(db)
    print("SUCCESS")
    print(stats)
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
