"""
Aplicación de tinte de cabello sobre máscara real, preservando luces y sombras.

Estrategia (LAB hue swap, no destructiva):

1. Convertir imagen RGB → LAB.
2. Sustituir los canales A y B del cabello por los del color objetivo, calculados
   a partir del color HEX (también en LAB). El canal L (luminancia) se conserva,
   por lo que mechones, brillos y sombras se mantienen.
3. Mezclar el resultado con el original usando la máscara feathered como alpha,
   modulado por la intensidad y el blend mode elegido.

Los blend modes ``multiply``, ``overlay`` y ``soft-light`` aplican una capa final
de color encima del recoloreado base para mantener compatibilidad con el frontend
y con el comportamiento del fallback elíptico.
"""

from __future__ import annotations

import cv2
import numpy as np


_ALLOWED_BLEND_MODES = {"multiply", "overlay", "soft-light"}


def _hex_a_rgb(hex_color: str) -> tuple[int, int, int]:
    s = str(hex_color or "").strip().lstrip("#")
    if len(s) == 3:
        s = "".join(c * 2 for c in s)
    if len(s) != 6:
        raise ValueError("Color HEX inválido")
    return int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16)


def _rgb_a_lab(rgb_tuple: tuple[int, int, int]) -> tuple[float, float, float]:
    """Color RGB 0-255 → LAB (L: 0-255, a/b: 0-255 codificados por OpenCV)."""
    px = np.array([[list(rgb_tuple)]], dtype=np.uint8)
    lab = cv2.cvtColor(px, cv2.COLOR_RGB2LAB)[0, 0]
    return float(lab[0]), float(lab[1]), float(lab[2])


def _blend_capa(base_f: np.ndarray, color_layer: np.ndarray, modo: str) -> np.ndarray:
    """Aplica blend mode estilo CSS sobre dos arrays float32 0-255 HxWx3."""
    base = base_f
    capa = color_layer
    if modo == "multiply":
        return (base * capa) / 255.0
    if modo == "overlay":
        low = base <= 127.5
        high = ~low
        salida = np.empty_like(base)
        salida[low] = (2.0 * base[low] * capa[low]) / 255.0
        salida[high] = 255.0 - (2.0 * (255.0 - base[high]) * (255.0 - capa[high])) / 255.0
        return salida
    if modo == "soft-light":
        base_n = base / 255.0
        capa_n = capa / 255.0
        out = (1 - 2 * capa_n) * (base_n ** 2) + 2 * capa_n * base_n
        return out * 255.0
    raise ValueError(f"blend_mode no soportado: {modo}")


def aplicar_tinte_real(
    imagen_rgb: np.ndarray,
    mascara: np.ndarray,
    color_hex: str,
    intensidad: int,
    blend_mode: str = "multiply",
) -> np.ndarray:
    """Recolorea el cabello segmentado preservando su luminancia.

    Args:
        imagen_rgb: ndarray HxWx3 uint8 RGB.
        mascara: ndarray HxW float32 en [0,1] (feathered) o booleana.
        color_hex: color objetivo en formato ``#RRGGBB``.
        intensidad: entero 5-90 que escala el alpha de la máscara.
        blend_mode: ``multiply | overlay | soft-light``.

    Returns:
        ndarray HxWx3 uint8 RGB con el cabello recoloreado.
    """
    if imagen_rgb.ndim != 3 or imagen_rgb.shape[2] != 3:
        raise ValueError("imagen_rgb debe ser HxWx3")
    if blend_mode not in _ALLOWED_BLEND_MODES:
        raise ValueError(f"blend_mode inválido: {blend_mode}")
    if mascara.shape[:2] != imagen_rgb.shape[:2]:
        raise ValueError("Tamaño de máscara distinto al de la imagen")

    if mascara.dtype == bool:
        alpha = mascara.astype(np.float32)
    else:
        alpha = mascara.astype(np.float32)
        if alpha.max() > 1.5:
            alpha = alpha / 255.0
    alpha = np.clip(alpha, 0.0, 1.0)

    factor = np.clip(int(intensidad), 5, 90) / 100.0
    alpha_efectivo = (alpha * factor)[..., None]  # HxWx1

    rgb_objetivo = _hex_a_rgb(color_hex)
    _, a_obj, b_obj = _rgb_a_lab(rgb_objetivo)

    lab = cv2.cvtColor(imagen_rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    lab_recoloreado = lab.copy()
    lab_recoloreado[..., 1] = a_obj
    lab_recoloreado[..., 2] = b_obj
    base_recoloreada = cv2.cvtColor(
        np.clip(lab_recoloreado, 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB
    ).astype(np.float32)

    color_layer = np.empty_like(base_recoloreada)
    color_layer[..., 0] = rgb_objetivo[0]
    color_layer[..., 1] = rgb_objetivo[1]
    color_layer[..., 2] = rgb_objetivo[2]
    blend = _blend_capa(base_recoloreada, color_layer, blend_mode)

    # Mezcla suave: 70% recolor base preserva luz, 30% capa blend acentúa color.
    mezcla_color = base_recoloreada * 0.7 + blend * 0.3

    original_f = imagen_rgb.astype(np.float32)
    salida = original_f * (1.0 - alpha_efectivo) + mezcla_color * alpha_efectivo
    return np.clip(salida, 0, 255).astype(np.uint8)


__all__ = ["aplicar_tinte_real"]
