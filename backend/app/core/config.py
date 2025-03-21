import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Project info
    PROJECT_NAME: str = "Finance Tracker API"
    PROJECT_VERSION: str = "1.0.0"
    PROJECT_DESCRIPTION: str = "API for personal finance tracking application"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/finance_tracker")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Password hashing
    PWD_CONTEXT_SCHEMES: List[str] = ["bcrypt"]
    PWD_CONTEXT_DEPRECATED: str = "auto"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()