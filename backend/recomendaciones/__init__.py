"""
Módulo de Recomendaciones
=========================
Contiene los generadores de recomendaciones para:
- Paletas de colores
- Estilos de ropa
- Estilos de cabello
"""

from .paleta_colores import generador_paleta
from .estilos_ropa import RecomendadorRopa
from .estilos_cabello import RecomendadorCabello

__all__ = ["generador_paleta", "RecomendadorRopa", "RecomendadorCabello"]

