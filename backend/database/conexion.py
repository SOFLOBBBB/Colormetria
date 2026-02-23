"""Conexión SQLite y sesiones para ColorMetría."""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'colormetria.db')}"
motor = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=motor)
Base = declarative_base()


def crear_tablas():
    Base.metadata.create_all(bind=motor)


def obtener_db():
    """Generador de sesión para inyección en FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
