import os
from functools import lru_cache
from typing import List, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str
    DEBUG: bool

    APP_ENV: str = "development"

    BACKEND_HOST: str
    BACKEND_PORT: int

    API_BASE_URL: str
    FRONTEND_URL: str

    CORS_ORIGINS: Union[str, List[str]]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    DATABASE_URL: str

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_BUCKET: str

    model_config = SettingsConfigDict(
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


@lru_cache
def get_settings() -> Settings:
    env = os.environ.get("APP_ENV", "development")
    env_file = f".env.{env}"
    
    # Fallback to .env if the specific environment file doesn't exist
    if not os.path.exists(env_file):
        env_file = ".env"
        
    return Settings(_env_file=env_file)


settings = get_settings()