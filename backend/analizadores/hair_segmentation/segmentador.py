"""
Loader lazy + inferencia BiSeNet para segmentación real de cabello.

Diseño:
- Singleton con caché global. Primera invocación: import torch, descarga del peso
  si falta, instanciación de la red y carga del state_dict. Siguientes invocaciones:
  reutilizan la instancia.
- Errores en la carga se cachean con cooldown para no martillar el sistema; el
  llamante decide si hace fallback (en nuestro caso, ``main.py`` cae a la elipse).
- Logs con prefijo ``[HairSeg]`` y ``flush=True`` para que aparezcan en Render/uvicorn.

NO importar este módulo al arranque del proceso. Importar bajo demanda dentro del
endpoint ``/hair-tryon``.
"""

from __future__ import annotations

import hashlib
import os
import tempfile
import threading
import time
import urllib.request
from typing import Optional

import cv2
import numpy as np


# Clase 17 del esquema CelebAMask-HQ = "hair".
CLASE_CABELLO = 17

# Mirrors HuggingFace del peso oficial de zllrunning/face-parsing.PyTorch.
# Mismo SHA256, hospedaje estable. Override con HAIR_BISENET_MODEL_URL.
_URL_DEFECTO = (
    "https://huggingface.co/vivym/face-parsing-bisenet/resolve/main/79999_iter.pth"
)
_URL_FALLBACK = (
    "https://huggingface.co/ManyOtherFunctions/face-parse-bisent/resolve/main/79999_iter.pth"
)
_SHA256_ESPERADO = "468e13ca13a9b43cc0881a9f99083a430e9c0a38abd935431d1c28ee94b26567"

# Normalización ImageNet usada en CelebAMask-HQ training.
_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)
_INPUT_SIDE = 512

_COOLDOWN_REINTENTO_SEGUNDOS = 120
_TIMEOUT_DESCARGA_SEGUNDOS = 240


class HairSegmentationError(RuntimeError):
    """Error específico del subsistema de segmentación de cabello."""


# ---------------------------------------------------------------------------
# Localización y descarga del peso
# ---------------------------------------------------------------------------

def _directorio_modelos() -> str:
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "modelos"))
    try:
        os.makedirs(base, exist_ok=True)
        return base
    except OSError:
        return tempfile.gettempdir()


def _ruta_peso() -> str:
    override = os.environ.get("HAIR_BISENET_MODEL_PATH", "").strip()
    if override:
        return os.path.abspath(override)
    return os.path.join(_directorio_modelos(), "bisenet_hair.pth")


def _sha256_archivo(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _descargar_peso(destino: str) -> None:
    """Descarga el peso desde el mirror configurado, con fallback secundario."""
    urls = [
        os.environ.get("HAIR_BISENET_MODEL_URL", "").strip() or _URL_DEFECTO,
        _URL_FALLBACK,
    ]
    last_err: Optional[BaseException] = None
    tmp = destino + ".partial"
    for url in [u for u in urls if u]:
        print(f"[HairSeg] Descargando peso BiSeNet desde {url} → {destino}", flush=True)
        t0 = time.time()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "ColorMetria/2.0"})
            with urllib.request.urlopen(req, timeout=_TIMEOUT_DESCARGA_SEGUNDOS) as resp, open(tmp, "wb") as f:
                total = 0
                while True:
                    chunk = resp.read(1 << 20)
                    if not chunk:
                        break
                    f.write(chunk)
                    total += len(chunk)
            os.replace(tmp, destino)
            tam_mb = os.path.getsize(destino) / (1024 * 1024)
            print(
                f"[HairSeg] Peso descargado ({tam_mb:.1f} MB) en {time.time() - t0:.1f}s",
                flush=True,
            )
            return
        except Exception as exc:
            last_err = exc
            print(f"[HairSeg] Falló descarga desde {url}: {exc!r}", flush=True)
            try:
                if os.path.isfile(tmp):
                    os.remove(tmp)
            except OSError:
                pass
    raise HairSegmentationError(
        "No se pudo descargar el peso BiSeNet. "
        "Coloque el archivo manualmente en "
        f"{destino} o defina HAIR_BISENET_MODEL_PATH. "
        f"Último error: {last_err!r}"
    )


def _asegurar_peso() -> str:
    path = _ruta_peso()
    if os.path.isfile(path) and os.path.getsize(path) > 10_000:
        print(f"[HairSeg] Peso BiSeNet encontrado en {path}", flush=True)
        return path
    _descargar_peso(path)
    if os.environ.get("HAIR_BISENET_VERIFY_SHA256", "1").strip().lower() in {"1", "true", "yes", "on"}:
        try:
            actual = _sha256_archivo(path)
            if actual != _SHA256_ESPERADO:
                print(
                    f"[HairSeg] WARN: sha256 del peso no coincide "
                    f"(esperado {_SHA256_ESPERADO}, got {actual}). "
                    f"Se usa de todos modos.",
                    flush=True,
                )
            else:
                print("[HairSeg] sha256 del peso verificado", flush=True)
        except Exception as exc:
            print(f"[HairSeg] WARN: no se pudo verificar sha256: {exc!r}", flush=True)
    return path


# ---------------------------------------------------------------------------
# Segmentador
# ---------------------------------------------------------------------------

class _SegmentadorCabelloBiSeNet:
    """Envoltura sobre el modelo BiSeNet ya cargado."""

    def __init__(self, modelo, torch_module):
        self._modelo = modelo
        self._torch = torch_module

    def segmentar_cabello(self, imagen_rgb: np.ndarray) -> np.ndarray:
        """Devuelve máscara booleana HxW (True donde hay cabello).

        Args:
            imagen_rgb: ndarray HxWx3 uint8 RGB.
        """
        if imagen_rgb is None or imagen_rgb.size == 0:
            raise HairSegmentationError("Imagen vacía")
        if imagen_rgb.ndim != 3 or imagen_rgb.shape[2] != 3:
            raise HairSegmentationError("Se esperaba imagen RGB HxWx3")

        H, W = imagen_rgb.shape[:2]
        t0 = time.time()
        resized = cv2.resize(imagen_rgb, (_INPUT_SIDE, _INPUT_SIDE), interpolation=cv2.INTER_AREA)
        tensor_np = resized.astype(np.float32) / 255.0
        tensor_np = (tensor_np - _MEAN) / _STD
        tensor_np = tensor_np.transpose(2, 0, 1)[None, ...]  # 1x3x512x512

        torch = self._torch
        with torch.inference_mode():
            entrada = torch.from_numpy(tensor_np)
            salida = self._modelo(entrada)
            logits = salida[0] if isinstance(salida, (tuple, list)) else salida
            etiquetas = logits.argmax(dim=1)[0].cpu().numpy().astype(np.uint8)

        mascara_512 = (etiquetas == CLASE_CABELLO).astype(np.uint8)
        mascara = cv2.resize(mascara_512, (W, H), interpolation=cv2.INTER_NEAREST).astype(bool)

        ratio = float(mascara.mean()) if mascara.size else 0.0
        print(
            f"[HairSeg] Inferencia BiSeNet: {time.time() - t0:.2f}s "
            f"(input {H}x{W}, cabello {ratio*100:.1f}% de pixeles)",
            flush=True,
        )
        return mascara


# ---------------------------------------------------------------------------
# Cache singleton
# ---------------------------------------------------------------------------

_lock = threading.Lock()
_segmentador_cache: Optional[_SegmentadorCabelloBiSeNet] = None
_error_cache: Optional[str] = None
_error_cache_ts: Optional[float] = None


def _construir_segmentador() -> _SegmentadorCabelloBiSeNet:
    """Importa torch, instancia BiSeNet y carga pesos. Operación pesada."""
    print("[HairSeg] Inicializando segmentador BiSeNet (lazy)", flush=True)
    t_inicio = time.time()

    import torch  # import LOCAL: nunca al top-level del proceso

    # Limita threads para no competir con uvicorn workers.
    try:
        torch.set_num_threads(int(os.environ.get("HAIR_BISENET_NUM_THREADS", "1")))
    except Exception:
        pass

    from .bisenet_model import BiSeNet

    ruta = _asegurar_peso()
    t_carga = time.time()
    modelo = BiSeNet(n_classes=19)
    state_dict = torch.load(ruta, map_location="cpu")
    if isinstance(state_dict, dict) and "state_dict" in state_dict and not any(
        k.startswith(("cp.", "ffm.", "conv_out")) for k in state_dict.keys()
    ):
        state_dict = state_dict["state_dict"]
    modelo.load_state_dict(state_dict, strict=False)
    modelo.eval()
    print(
        f"[HairSeg] BiSeNet listo en {time.time() - t_inicio:.1f}s "
        f"(load_state_dict {time.time() - t_carga:.1f}s, torch={torch.__version__})",
        flush=True,
    )
    return _SegmentadorCabelloBiSeNet(modelo=modelo, torch_module=torch)


def obtener_segmentador_cabello() -> _SegmentadorCabelloBiSeNet:
    """Devuelve la instancia cacheada del segmentador. Carga lazy + cooldown de error."""
    global _segmentador_cache, _error_cache, _error_cache_ts

    if _segmentador_cache is not None:
        return _segmentador_cache

    with _lock:
        if _segmentador_cache is not None:
            return _segmentador_cache
        if _error_cache and _error_cache_ts is not None:
            transcurrido = time.time() - _error_cache_ts
            if transcurrido < _COOLDOWN_REINTENTO_SEGUNDOS:
                raise HairSegmentationError(
                    f"BiSeNet en cooldown ({int(_COOLDOWN_REINTENTO_SEGUNDOS - transcurrido)}s "
                    f"restantes). Último error: {_error_cache}"
                )
            _error_cache = None
            _error_cache_ts = None
        try:
            _segmentador_cache = _construir_segmentador()
            return _segmentador_cache
        except Exception as exc:
            _error_cache = str(exc)
            _error_cache_ts = time.time()
            print(f"[HairSeg] ERROR cargando BiSeNet: {exc!r}", flush=True)
            raise HairSegmentationError(str(exc)) from exc


def refinar_mascara_cabello(
    mascara: np.ndarray,
    *,
    kernel_px: int = 5,
    feather_px: int = 9,
) -> np.ndarray:
    """Suaviza la máscara binaria de cabello.

    1) Closing morfológico para tapar agujeritos.
    2) Opening leve para quitar speckles.
    3) Gaussian blur sobre la versión float para bordes con feather suave.

    Devuelve ndarray float32 HxW en [0, 1].
    """
    if mascara is None or mascara.size == 0:
        raise HairSegmentationError("Máscara vacía")
    binaria = (mascara.astype(np.uint8)) * 255
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_px, kernel_px))
    binaria = cv2.morphologyEx(binaria, cv2.MORPH_CLOSE, kernel)
    binaria = cv2.morphologyEx(binaria, cv2.MORPH_OPEN, kernel)
    if feather_px and feather_px > 0:
        k = feather_px if feather_px % 2 == 1 else feather_px + 1
        suavizada = cv2.GaussianBlur(binaria.astype(np.float32) / 255.0, (k, k), 0)
    else:
        suavizada = binaria.astype(np.float32) / 255.0
    return np.clip(suavizada, 0.0, 1.0)


__all__ = [
    "obtener_segmentador_cabello",
    "refinar_mascara_cabello",
    "HairSegmentationError",
    "CLASE_CABELLO",
]
