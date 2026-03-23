"""
Compatibilidad MediaPipe: Face Mesh clásico (mp.solutions) o Face Landmarker (Tasks).

En mediapipe>=0.10.31 se eliminó `mediapipe.solutions`. Las versiones nuevas usan
`mediapipe.tasks.vision.FaceLandmarker` con un archivo .task.
"""

from __future__ import annotations

import os
import tempfile
import time
import urllib.request
from dataclasses import dataclass
from typing import Any, List, Optional

import cv2
import numpy as np

# URL oficial del modelo float16 (mismo que documentación MediaPipe)
_URL_FACE_LANDMARKER = (
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/"
    "face_landmarker/float16/1/face_landmarker.task"
)


@dataclass
class _Landmark:
    x: float
    y: float
    z: float


@dataclass
class _FaceLandmarks:
    """Misma forma que el objeto devuelto por solutions.face_mesh."""

    landmark: List[_Landmark]


class _ProcessResult:
    """Como el return de FaceMesh.process(): multi_face_landmarks o None."""

    __slots__ = ("multi_face_landmarks",)

    def __init__(self, multi_face_landmarks: Optional[List[_FaceLandmarks]]):
        self.multi_face_landmarks = multi_face_landmarks


def _directorio_modelos() -> str:
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "modelos"))
    try:
        os.makedirs(base, exist_ok=True)
        return base
    except OSError:
        return tempfile.gettempdir()


def _ruta_modelo_face_landmarker() -> str:
    return os.path.join(_directorio_modelos(), "face_landmarker.task")


def _asegurar_modelo_descargado() -> str:
    """Ruta al .task; descarga si falta (p. ej. Render en primer arranque)."""
    env_path = os.environ.get("MEDIAPIPE_FACE_MODEL_PATH", "").strip()
    if env_path and os.path.isfile(env_path) and os.path.getsize(env_path) > 10_000:
        return os.path.abspath(env_path)

    path = _ruta_modelo_face_landmarker()
    if os.path.isfile(path) and os.path.getsize(path) > 10_000:
        return path

    last_err: Optional[BaseException] = None
    for intento in range(3):
        tmp = path + ".partial"
        try:
            req = urllib.request.Request(
                _URL_FACE_LANDMARKER,
                headers={"User-Agent": "ColorMetria/2.0"},
            )
            with urllib.request.urlopen(req, timeout=180) as resp, open(tmp, "wb") as f:
                f.write(resp.read())
            os.replace(tmp, path)
            return path
        except Exception as e:
            last_err = e
            try:
                if os.path.isfile(tmp):
                    os.remove(tmp)
            except OSError:
                pass
            if intento < 2:
                time.sleep(2.0 * (intento + 1))
    raise RuntimeError(
        "No se pudo descargar face_landmarker.task. "
        "Defina MEDIAPIPE_FACE_MODEL_PATH a un .task local o compruebe red/SSL. "
        f"Ultimo error: {last_err!r}"
    ) from last_err


class FaceMeshCompat:
    """
    Expone `.process(imagen_bgr)` como `mediapipe.solutions.face_mesh.FaceMesh`.
    Usa la API clásica si existe; si no, Face Landmarker (Tasks).
    """

    def __init__(self) -> None:
        import mediapipe as mp

        self._mp = mp
        self._legacy = None
        self._task_landmarker = None

        # No usar hasattr(mp, "solutions"): en varias versiones el fallo solo aparece
        # al acceder a mp.solutions (p. ej. tras __getattr__). Siempre intentar legacy
        # con try/except y caer a Tasks (mediapipe>=0.10.31).
        try:
            self._legacy = mp.solutions.face_mesh.FaceMesh(
                static_image_mode=True,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
            )
        except (AttributeError, ModuleNotFoundError):
            # mediapipe>=0.10.31: sin mp.solutions → Face Landmarker (Tasks)
            self._init_face_landmarker_tasks()

    def _init_face_landmarker_tasks(self) -> None:
        mp = self._mp
        model_path = _asegurar_modelo_descargado()
        BaseOptions = mp.tasks.BaseOptions
        FaceLandmarker = mp.tasks.vision.FaceLandmarker
        FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
        VisionRunningMode = mp.tasks.vision.RunningMode

        options = FaceLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=model_path),
            running_mode=VisionRunningMode.IMAGE,
            num_faces=1,
            min_face_detection_confidence=0.5,
            min_face_presence_confidence=0.5,
            min_tracking_confidence=0.5,
            output_face_blendshapes=False,
        )
        self._task_landmarker = FaceLandmarker.create_from_options(options)

    def process(self, imagen_bgr: np.ndarray) -> Any:
        if self._legacy is not None:
            return self._legacy.process(imagen_bgr)
        return self._process_tasks(imagen_bgr)

    def _process_tasks(self, imagen_bgr: np.ndarray) -> _ProcessResult:
        rgb = cv2.cvtColor(imagen_bgr, cv2.COLOR_BGR2RGB)
        rgb = np.ascontiguousarray(rgb, dtype=np.uint8)
        mp = self._mp
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        assert self._task_landmarker is not None
        result = self._task_landmarker.detect(mp_image)

        if not result.face_landmarks:
            return _ProcessResult(None)

        caras: List[_FaceLandmarks] = []
        for cara in result.face_landmarks:
            puntos: List[_Landmark] = []
            for lm in cara:
                puntos.append(_Landmark(lm.x, lm.y, lm.z))
            caras.append(_FaceLandmarks(landmark=puntos))

        return _ProcessResult(caras)

    def close(self) -> None:
        if self._legacy is not None:
            self._legacy.close()
            self._legacy = None
        if self._task_landmarker is not None:
            try:
                self._task_landmarker.close()
            except Exception:
                pass
            self._task_landmarker = None

    def __del__(self) -> None:
        try:
            self.close()
        except Exception:
            pass
