"""
Módulo de Analizadores
======================
Contiene los analizadores para detección de rostro,
análisis de colores y clasificación de estaciones.
"""

from .detector_rostro import DetectorRostro
from .analizador_colores import AnalizadorColores
from .clasificador_estacion import ClasificadorEstacion

__all__ = ["DetectorRostro", "AnalizadorColores", "ClasificadorEstacion"]

