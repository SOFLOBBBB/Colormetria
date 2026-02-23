"""
Atributos faciales opcionales (edad, género, emoción) vía DeepFace.

Si deepface no está instalado, todas las funciones devuelven None.
Instalación: pip install deepface
"""

from typing import Optional, Dict, Any
import numpy as np

_DEEPFACE_DISPONIBLE = False
try:
    from deepface import DeepFace
    _DEEPFACE_DISPONIBLE = True
except ImportError:
    pass


def analizar_atributos(imagen_rgb: np.ndarray) -> Optional[Dict[str, Any]]:
    """
    Devuelve edad, género y emoción si DeepFace está instalado y detecta un rostro.
    imagen_rgb: array (H, W, 3) uint8 RGB.
    """
    if not _DEEPFACE_DISPONIBLE:
        return None
    try:
        import cv2
        # DeepFace espera BGR (convención OpenCV)
        imagen_bgr = cv2.cvtColor(imagen_rgb, cv2.COLOR_RGB2BGR)
        result = DeepFace.analyze(
            imagen_bgr,
            actions=["age", "gender", "emotion"],
            enforce_detection=False,
            silent=True,
        )
        if not result:
            return None
        r = result[0] if isinstance(result, list) else result
        emociones = r.get("emotion") or {}
        emocion = r.get("dominant_emotion") or (list(emociones.keys())[0] if emociones else None)
        genero_raw = r.get("dominant_gender") or r.get("gender") or ""
        genero = "femenino" if "woman" in genero_raw.lower() else "masculino" if "man" in genero_raw.lower() else ""
        return {
            "edad_aprox": r.get("age"),
            "genero": genero,
            "emocion": emocion,
        }
    except Exception:
        return None


def esta_disponible() -> bool:
    """Indica si DeepFace está instalado y usable."""
    return _DEEPFACE_DISPONIBLE
