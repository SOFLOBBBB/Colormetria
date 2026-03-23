"""
Entorno gráfico headless para MediaPipe / TensorFlow Lite (Render, Docker).

TFLite suele hacer dlopen("libGLESv2.so.2") sin ruta; Mesa la instala en
/usr/lib/*/mesa/. Además de LD_LIBRARY_PATH, precargamos EGL+GLES con ctypes
(RTLD_GLOBAL) para que el enlazador dinámico resuelva símbolos antes del
delegate de TFLite.
"""

from __future__ import annotations

import ctypes
import os


def _mesa_paths_por_arquitectura() -> tuple[str, ...]:
    return (
        "/usr/lib/x86_64-linux-gnu/mesa",
        "/usr/lib/aarch64-linux-gnu/mesa",
        "/usr/lib/x86_64-linux-gnu",
        "/usr/lib/aarch64-linux-gnu",
    )


def configurar_ld_library_path_mesa() -> None:
    """Antepone rutas típicas de Mesa a LD_LIBRARY_PATH si existen."""
    existentes = [p for p in _mesa_paths_por_arquitectura() if os.path.isdir(p)]
    if not existentes:
        return
    prefijo = ":".join(existentes)
    actual = os.environ.get("LD_LIBRARY_PATH", "").strip()
    if actual:
        os.environ["LD_LIBRARY_PATH"] = f"{prefijo}:{actual}"
    else:
        os.environ["LD_LIBRARY_PATH"] = prefijo


def precargar_mesa_egl_gles() -> None:
    """
    Carga libEGL y libGLESv2 desde rutas absolutas (Mesa).
    Debe llamarse tras configurar_ld_library_path_mesa y antes de importar mediapipe.
    """
    for arch in ("x86_64-linux-gnu", "aarch64-linux-gnu"):
        lib = f"/usr/lib/{arch}"
        mesa = f"{lib}/mesa"
        # Orden: GLdispatch (a veces fuera de mesa/) → EGL → GLESv2
        rutas = [
            f"{lib}/libGLdispatch.so.0",
            f"{mesa}/libGLdispatch.so.0",
            f"{mesa}/libEGL.so.1",
            f"{mesa}/libGLESv2.so.2",
        ]
        try:
            alguna = False
            for ruta in rutas:
                if os.path.isfile(ruta):
                    ctypes.CDLL(ruta, mode=ctypes.RTLD_GLOBAL)
                    alguna = True
            if alguna:
                return
        except OSError:
            continue
    # Fallback: solo GLESv2 por nombre corto (usa LD_LIBRARY_PATH / ldconfig)
    for nombre in ("libEGL.so.1", "libGLESv2.so.2"):
        try:
            ctypes.CDLL(nombre, mode=ctypes.RTLD_GLOBAL)
        except OSError:
            pass


def configurar_entorno_mesa_completo() -> None:
    """LD_LIBRARY_PATH + precarga EGL/GLES; llamar al inicio del proceso."""
    configurar_ld_library_path_mesa()
    precargar_mesa_egl_gles()

