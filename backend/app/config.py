from typing import List, Union
import os
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nepal Stock Market Intelligence API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "SUPER_SECRET_KEY_FOR_NEPAL_STOCK_MARKET_INTELLIGENCE_APP_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database & Redis
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./nepse_dev.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "*"]
    
    # Crawler Settings
    CRAWLER_DELAY_SECONDS: float = 1.0
    CRAWLER_MAX_RETRIES: int = 3
    CRAWLER_TIMEOUT_SECONDS: int = 15
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
