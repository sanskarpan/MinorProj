import os
from enum import Enum
from pathlib import Path

class Environment(str, Enum):
    DEVELOPMENT = "development"
    TESTING = "testing"
    PRODUCTION = "production"

def get_env() -> Environment:
    """Get current environment"""
    env = os.getenv("ENV", "development")
    if env == "production":
        return Environment.PRODUCTION
    elif env == "testing":
        return Environment.TESTING
    return Environment.DEVELOPMENT

def is_development() -> bool:
    """Check if environment is development"""
    return get_env() == Environment.DEVELOPMENT

def is_production() -> bool:
    """Check if environment is production"""
    return get_env() == Environment.PRODUCTION

def is_testing() -> bool:
    """Check if environment is testing"""
    return get_env() == Environment.TESTING

def get_project_root() -> Path:
    """Returns project root folder."""
    return Path(__file__).parent.parent.parent

def load_env_file():
    """
    Load environment variables from the .env file.
    This function can be called at application startup.
    """
    from dotenv import load_dotenv
    
    env_file = get_project_root() / ".env"
    if env_file.exists():
        load_dotenv(env_file)
        print(f"Loaded environment variables from {env_file}")
    else:
        print("Warning: .env file not found")