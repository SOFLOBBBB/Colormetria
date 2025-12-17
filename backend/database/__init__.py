"""
Módulo de Base de Datos
=======================
Configuración y modelos de la base de datos SQLite.
"""

from .conexion import obtener_db, crear_tablas, motor
from .modelos import Usuario, Analisis, Recomendacion
from .crud import CRUDUsuario, CRUDAnalisis, CRUDRecomendacion

__all__ = [
    "obtener_db",
    "crear_tablas", 
    "motor",
    "Usuario",
    "Analisis", 
    "Recomendacion",
    "CRUDUsuario",
    "CRUDAnalisis",
    "CRUDRecomendacion"
]

