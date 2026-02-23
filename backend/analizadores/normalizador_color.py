"""Normalización de iluminación (Color Constancy) para análisis estable de subtono."""

import cv2
import numpy as np
from typing import Tuple, Optional


class NormalizadorColor:
    """Shades of Gray, Gray World o Retinex para corregir balance de blancos."""

    def __init__(self, metodo: str = "shades_of_gray", minkowski_p: float = 6.0):
        self.metodo = metodo
        self.minkowski_p = minkowski_p

    def normalizar(self, imagen_rgb: np.ndarray) -> np.ndarray:
        """Devuelve imagen RGB normalizada (uint8)."""
        if self.metodo == "shades_of_gray":
            return self._shades_of_gray(imagen_rgb)
        if self.metodo == "gray_world":
            return self._gray_world(imagen_rgb)
        if self.metodo == "retinex":
            return self._retinex_simple(imagen_rgb)
        return imagen_rgb

    def _shades_of_gray(self, imagen_rgb: np.ndarray) -> np.ndarray:
        """Norma Minkowski por canal; ganancias para igualar iluminación."""
        img_float = imagen_rgb.astype(np.float32) + 1e-8
        h, w = img_float.shape[:2]
        n = h * w
        normas = [
            np.power(np.sum(np.power(img_float[:, :, c], self.minkowski_p)) / n, 1.0 / self.minkowski_p)
            for c in range(3)
        ]
        ilum = np.prod(normas) ** (1.0 / 3.0)
        ganancias = ilum / np.array(normas)
        img_corregida = img_float * ganancias[np.newaxis, np.newaxis, :]
        return np.clip(img_corregida, 0, 255).astype(np.uint8)

    def _gray_world(self, imagen_rgb: np.ndarray) -> np.ndarray:
        """Promedio global gris; ganancias por canal."""
        img_float = imagen_rgb.astype(np.float32)
        promedios = np.mean(img_float.reshape(-1, 3), axis=0)
        ganancias = np.mean(promedios) / (promedios + 1e-8)
        img_corregida = img_float * ganancias[np.newaxis, np.newaxis, :]
        return np.clip(img_corregida, 0, 255).astype(np.uint8)

    def _retinex_simple(self, imagen_rgb: np.ndarray) -> np.ndarray:
        """Retinex multiescala (blur gaussiano + log-ratio)."""
        img_float = imagen_rgb.astype(np.float32) / 255.0
        escalas = [15, 80, 250]
        img_ref = np.zeros_like(img_float)
        for escala in escalas:
            k = int(escala * 2) + 1
            if k % 2 == 0:
                k += 1
            blur = cv2.GaussianBlur(img_float, (k, k), escala)
            img_ref += (np.log(img_float + 1e-8) - np.log(blur + 1e-8)) / len(escalas)
        r_min, r_max = img_ref.min(), img_ref.max()
        img_ref = (img_ref - r_min) / (r_max - r_min + 1e-8)
        return (img_ref * 255).astype(np.uint8)


def detectar_imagen_no_confiable(
    imagen_rgb: np.ndarray,
    landmarks: Optional[list] = None,
    umbral_varianza_l: float = 30.0,
    umbral_highlight: float = 240.0,
) -> Tuple[bool, str]:
    """Indica si la imagen no es fiable (varianza L*, highlights, rostro parcial, luminosidad extrema)."""
    lab = cv2.cvtColor(imagen_rgb, cv2.COLOR_RGB2LAB)
    l_channel = lab[:, :, 0].astype(np.float32)
    var_l = np.var(l_channel)
    if var_l > umbral_varianza_l:
        return True, f"Varianza de luminosidad alta ({var_l:.1f} > {umbral_varianza_l})"
    pct_hl = np.sum(imagen_rgb > umbral_highlight) / imagen_rgb.size * 100
    if pct_hl > 5.0:
        return True, f"Demasiados highlights ({pct_hl:.1f}% > 5%)"
    if landmarks is not None and len(landmarks) < 400:
        return True, f"Rostro parcial ({len(landmarks)} landmarks < 400)"
    lum = np.mean(l_channel)
    if lum < 20 or lum > 200:
        return True, f"Luminosidad extrema (L={lum:.0f})"
    return False, "OK"
