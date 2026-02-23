"""Base de datos: conexión, modelos y CRUD."""

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
    "CRUDRecomendacion",
]

