"""
Segmentación real de cabello con BiSeNet (face parsing).

Módulo AISLADO: ningún import pesado (torch, torchvision) ocurre al importar este
paquete. Todo es lazy y se carga sólo cuando se invoca ``obtener_segmentador_cabello``.

Uso típico desde el endpoint:

    from analizadores.hair_segmentation import obtener_segmentador_cabello

    seg = obtener_segmentador_cabello()       # carga lazy
    mascara = seg.segmentar_cabello(rgb_np)   # ndarray bool HxW
"""

from .segmentador import (
    obtener_segmentador_cabello,
    refinar_mascara_cabello,
    HairSegmentationError,
)
from .tinte import aplicar_tinte_real

__all__ = [
    "obtener_segmentador_cabello",
    "refinar_mascara_cabello",
    "aplicar_tinte_real",
    "HairSegmentationError",
]
