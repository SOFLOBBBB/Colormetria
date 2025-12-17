"""
Conexión a Base de Datos
========================
Configuración de SQLAlchemy para SQLite.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Ruta de la base de datos SQLite
RUTA_BD = os.path.join(os.path.dirname(os.path.dirname(__file__)), "colormetria.db")
URL_BASE_DATOS = f"sqlite:///{RUTA_BD}"

# Crear motor de base de datos
motor = create_engine(
    URL_BASE_DATOS,
    connect_args={"check_same_thread": False},  # Necesario para SQLite
    echo=False  # Cambiar a True para ver queries SQL
)

# Crear sesión
SesionLocal = sessionmaker(autocommit=False, autoflush=False, bind=motor)

# Base para modelos
Base = declarative_base()


def obtener_db():
    """
    Generador que proporciona una sesión de base de datos.
    Se usa como dependencia en los endpoints de FastAPI.
    
    Yields:
        Session: Sesión de SQLAlchemy
    """
    db = SesionLocal()
    try:
        yield db
    finally:
        db.close()


def crear_tablas():
    """
    Crea todas las tablas definidas en los modelos.
    Se ejecuta al iniciar la aplicación.
    """
    from .modelos import Usuario, Analisis, Recomendacion  # Importar para registrar modelos
    Base.metadata.create_all(bind=motor)
    print("✅ Tablas de base de datos creadas correctamente")

