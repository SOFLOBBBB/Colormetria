"""Detección de rostro y 478 landmarks con MediaPipe Face Mesh."""

import cv2
import numpy as np
import mediapipe as mp
from typing import Dict, Any, List, Tuple, Optional


class DetectorRostro:
    """Detección de rostro y landmarks para análisis de colorimetría."""

    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )
    
    def detectar(self, imagen_rgb: np.ndarray) -> Optional[Dict[str, Any]]:
        """Devuelve landmarks y bbox del rostro, o None si no hay detección."""
        altura, ancho = imagen_rgb.shape[:2]
        imagen_bgr = cv2.cvtColor(imagen_rgb, cv2.COLOR_RGB2BGR)
        resultados = self.face_mesh.process(imagen_bgr)
        if not resultados.multi_face_landmarks:
            return None
        face_landmarks = resultados.multi_face_landmarks[0]
        landmarks = [
            (int(lm.x * ancho), int(lm.y * altura), lm.z)
            for lm in face_landmarks.landmark
        ]
        xs = [p[0] for p in landmarks]
        ys = [p[1] for p in landmarks]
        x_min, x_max = min(xs), max(xs)
        y_min, y_max = min(ys), max(ys)
        region_rostro = {
            "x": max(0, x_min - 20),
            "y": max(0, y_min - 20),
            "ancho": min(ancho, x_max - x_min + 40),
            "alto": min(altura, y_max - y_min + 40),
        }
        return {
            "landmarks": landmarks,
            "region_rostro": region_rostro,
            "n_landmarks": len(landmarks),
        }
