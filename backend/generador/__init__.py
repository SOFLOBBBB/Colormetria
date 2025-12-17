"""
Módulo de Generación de Imágenes
================================
Contiene herramientas para:
- Cambio virtual de cabello con SAM + Inpainting
- Visualización de outfits desde base de datos curada
"""

from .cambio_cabello import GeneradorCabello
from .buscador_outfits import BuscadorOutfits

__all__ = ['GeneradorCabello', 'BuscadorOutfits']
