from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

SQLALCHEMY_DATABASE_URL = settings.get_db_url()

engine_args = {}
if "neon.tech" in SQLALCHEMY_DATABASE_URL:
    engine_args.update({
        "pool_pre_ping": True,  # Check connection before using from pool
        "pool_recycle": 300,    # Recycle connections every 5 minutes
        "pool_size": 5,         # Maintain a pool of 5 connections
        "max_overflow": 10      # Allow up to 10 overflow connections
    })

engine = create_engine(SQLALCHEMY_DATABASE_URL,**engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    