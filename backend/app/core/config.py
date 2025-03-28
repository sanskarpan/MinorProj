import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Project info
    PROJECT_NAME: str
    PROJECT_VERSION: str
    PROJECT_DESCRIPTION: str
    
    # Database
    DATABASE_URL: str
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    # Password hashing
    PWD_CONTEXT_SCHEMES: List[str] = ["bcrypt"]
    PWD_CONTEXT_DEPRECATED: str = "auto"
    
    # Environment
    ENV: Optional[str] = os.getenv("ENV", "development")
    
    # SSL Settings for Neon Postgres
    SSL_MODE: Optional[str] = os.getenv("SSL_MODE", "require")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )
    
    @property
    def database_url_with_ssl(self) -> str:
        """
        If using Neon Postgres, ensure SSL is properly configured
        """
        if "neon.tech" in self.DATABASE_URL and "sslmode=" not in self.DATABASE_URL:
            if "?" in self.DATABASE_URL:
                return f"{self.DATABASE_URL}&sslmode={self.SSL_MODE}"
            else:
                return f"{self.DATABASE_URL}?sslmode={self.SSL_MODE}"
        return self.DATABASE_URL
    
    def get_db_url(self) -> str:
        """
        Return the database URL with SSL configuration if necessary
        """
        return self.database_url_with_ssl

settings = Settings()