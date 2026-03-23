"""
Rutas de biblioteca para Mesa/GLES en servidores sin GPU (Docker, Render).

TensorFlow Lite (MediaPipe) hace dlopen de libGLESv2.so.2; en Debian el .so
suele estar en /usr/lib/*/mesa/ y el enlazador no siempre lo resuelve solo.
Debe ejecutarse antes de importar cv2/mediapipe/tensorflow.
"""

from __future__ import annotations

import os


def configurar_ld_library_path_mesa() -> None:
    """Antepone rutas típicas de Mesa a LD_LIBRARY_PATH si existen."""
    candidatos = (
        "/usr/lib/x86_64-linux-gnu/mesa",
        "/usr/lib/aarch64-linux-gnu/mesa",
        "/usr/lib/x86_64-linux-gnu",
        "/usr/lib/aarch64-linux-gnu",
    )
    existentes = [p for p in candidatos if os.path.isdir(p)]
    if not existentes:
        return
    prefijo = ":".join(existentes)
    actual = os.environ.get("LD_LIBRARY_PATH", "").strip()
    if actual:
        os.environ["LD_LIBRARY_PATH"] = f"{prefijo}:{actual}"
    else:
        os.environ["LD_LIBRARY_PATH"] = prefijo
