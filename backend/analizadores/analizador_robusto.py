"""Análisis de colorimetría en CIELAB: subtono, contraste y chroma con ROIs de piel y cabello."""

import cv2
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
import mediapipe as mp
from .normalizador_color import NormalizadorColor, detectar_imagen_no_confiable


class AnalizadorRobusto:
    """Extrae features en LAB (medianas) a partir de ROIs de piel y cabello."""

    def __init__(self, usar_normalizacion: bool = True):
        self.normalizador = NormalizadorColor(metodo="shades_of_gray") if usar_normalizacion else None
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
        )
    
    def analizar(
        self,
        imagen_rgb: np.ndarray,
        landmarks: Optional[List[Tuple[int, int, float]]] = None,
    ) -> Dict[str, Any]:
        """Pipeline: landmarks (si faltan) → normalizar → ROIs piel/cabello → LAB → features y confiabilidad."""
        altura, ancho = imagen_rgb.shape[:2]
        
        # Paso 1: Detectar landmarks si no están dados
        if landmarks is None:
            landmarks_result = self.face_mesh.process(cv2.cvtColor(imagen_rgb, cv2.COLOR_RGB2BGR))
            if not landmarks_result.multi_face_landmarks:
                return {
                    "error": "No se detectó rostro",
                    "confiable": False
                }
            face_landmarks = landmarks_result.multi_face_landmarks[0]
            landmarks = [
                (int(landmark.x * ancho), int(landmark.y * altura), landmark.z)
                for landmark in face_landmarks.landmark
            ]
        
        # Paso 2: Normalizar color (ANTES de todo análisis)
        if self.normalizador:
            imagen_norm = self.normalizador.normalizar(imagen_rgb)
        else:
            imagen_norm = imagen_rgb.copy()
        
        # Paso 3: Extraer ROIs precisas
        roi_piel = self._extraer_roi_piel(imagen_norm, landmarks, altura, ancho)
        roi_cabello = self._extraer_roi_cabello(imagen_norm, landmarks, altura, ancho)
        
        if roi_piel is None or len(roi_piel) == 0:
            return {
                "error": "No se pudo extraer ROI de piel",
                "confiable": False
            }
        
        # Paso 4: Convertir a LAB
        lab_piel = self._convertir_a_lab(roi_piel)
        lab_cabello = self._convertir_a_lab(roi_cabello) if roi_cabello is not None and len(roi_cabello) > 0 else None
        
        # Paso 5: Calcular features
        features = self._calcular_features(lab_piel, lab_cabello)
        
        # Paso 6: Validar confiabilidad
        es_no_confiable, razon = detectar_imagen_no_confiable(imagen_norm, landmarks)
        
        resultado = {
            "confiable": not es_no_confiable,
            "razon_no_confiable": razon if es_no_confiable else None,
            "features": features,
            "roi_piel_rgb": np.median(roi_piel, axis=0).astype(int).tolist() if roi_piel is not None else None,
            "roi_cabello_rgb": np.median(roi_cabello, axis=0).astype(int).tolist() if roi_cabello is not None else None
        }
        
        return resultado
    
    def _extraer_roi_piel(
        self,
        imagen_rgb: np.ndarray,
        landmarks: List[Tuple[int, int, float]],
        altura: int,
        ancho: int,
    ) -> Optional[np.ndarray]:
        """Píxeles de mejillas y mandíbula (excluye labios); índices MediaPipe Face Mesh."""
        indices_mejillas = [50, 101, 118, 119, 280, 330, 347, 348]
        indices_mandibula = [172, 173, 174, 175, 176, 200, 201, 202, 203, 204]
        indices_labios = list(range(61, 77)) + list(range(78, 94))
        indices_excluir = set(indices_labios)
        
        pixeles_piel = []
        
        # Extraer píxeles alrededor de landmarks de mejillas y mandíbula
        radio = 15  # Radio en píxeles
        
        for idx, (x, y, z) in enumerate(landmarks):
            if idx in indices_excluir:
                continue
            
            if idx in indices_mejillas or idx in indices_mandibula:
                # Extraer píxeles en círculo alrededor del landmark
                for dy in range(-radio, radio + 1):
                    for dx in range(-radio, radio + 1):
                        if dx*dx + dy*dy <= radio*radio:
                            ny, nx = int(y + dy), int(x + dx)
                            if 0 <= ny < altura and 0 <= nx < ancho:
                                pixel = imagen_rgb[ny, nx]
                                # Filtrar highlights y sombras extremas
                                brillo = np.mean(pixel)
                                if 40 < brillo < 240:  # Excluir muy oscuro o muy claro
                                    pixeles_piel.append(pixel)
        
        if len(pixeles_piel) < 50:
            # Fallback: usar región central de mejillas
            for idx in [50, 280]:  # Mejilla izquierda y derecha
                if idx < len(landmarks):
                    x, y = int(landmarks[idx][0]), int(landmarks[idx][1])
                    region = imagen_rgb[max(0, y-20):min(altura, y+20), max(0, x-20):min(ancho, x+20)]
                    if region.size > 0:
                        brillos = np.mean(region.reshape(-1, 3), axis=1)
                        mascara = (brillos > 40) & (brillos < 240)
                        pixeles_validos = region.reshape(-1, 3)[mascara]
                        if len(pixeles_validos) > 0:
                            pixeles_piel.extend(pixeles_validos.tolist())
        
        if len(pixeles_piel) == 0:
            return None
        
        return np.array(pixeles_piel, dtype=np.uint8)
    
    def _extraer_roi_cabello(
        self,
        imagen_rgb: np.ndarray,
        landmarks: List[Tuple[int, int, float]],
        altura: int,
        ancho: int,
    ) -> Optional[np.ndarray]:
        """Región superior al rostro (frente); landmarks 10, 151, 337."""
        indices_frente = [10, 151, 337]
        
        if len(landmarks) < max(indices_frente) + 1:
            return None
        
        # Calcular Y mínimo (parte superior del rostro)
        y_min = min(landmarks[i][1] for i in indices_frente if i < len(landmarks))
        y_top = max(0, int(y_min - altura * 0.15))  # 15% arriba de la frente
        y_bottom = max(0, int(y_min - altura * 0.05))
        
        # Ancho: entre las sienes (landmarks laterales)
        x_left = max(0, int(ancho * 0.15))
        x_right = min(ancho, int(ancho * 0.85))
        
        if y_top >= y_bottom or x_left >= x_right:
            return None
        
        region_cabello = imagen_rgb[y_top:y_bottom, x_left:x_right]
        if region_cabello.size == 0:
            return None
        
        pixeles = region_cabello.reshape(-1, 3)
        # Filtrar fondo blanco (brillo alto)
        brillos = np.mean(pixeles, axis=1)
        mascara = brillos < 230  # Excluir fondo muy claro
        pixeles_filtrados = pixeles[mascara]
        
        if len(pixeles_filtrados) < 20:
            return None
        
        return pixeles_filtrados
    
    def _convertir_a_lab(self, pixeles_rgb: np.ndarray) -> np.ndarray:
        """Array (N, 3) con L*, a* y b* centrados (a*, b* en [-128, 127])."""
        if len(pixeles_rgb) == 0:
            return np.array([]).reshape(0, 3)
        
        # Reshape para OpenCV: (1, N, 3)
        pixeles_reshaped = pixeles_rgb.reshape(1, -1, 3).astype(np.uint8)
        
        # Convertir a LAB
        lab = cv2.cvtColor(pixeles_reshaped, cv2.COLOR_RGB2LAB)
        lab_flat = lab.reshape(-1, 3).astype(np.float32)
        
        # OpenCV LAB: L*[0-100] (ya normalizado), a*[0-255], b*[0-255]
        # Convertir a CIELAB estándar: a*[-128,127], b*[-128,127]
        lab_flat[:, 1] = lab_flat[:, 1] - 128.0  # a* centrado
        lab_flat[:, 2] = lab_flat[:, 2] - 128.0  # b* centrado
        
        return lab_flat
    
    def _calcular_features(
        self,
        lab_piel: np.ndarray,
        lab_cabello: Optional[np.ndarray],
    ) -> Dict[str, Any]:
        """Subtono, contraste y chroma a partir de medianas en LAB."""
        if len(lab_piel) == 0:
            return {}
        
        # Features de piel
        l_piel = lab_piel[:, 0]  # L* [0-100]
        a_piel = lab_piel[:, 1]  # a* [-128, 127]
        b_piel = lab_piel[:, 2]  # b* [-128, 127]
        
        # Mediana (robusta a outliers)
        median_a = np.median(a_piel)
        median_b = np.median(b_piel)
        median_l = np.median(l_piel)
        
        # Chroma: C* = sqrt(a*^2 + b*^2)
        chroma = np.sqrt(a_piel**2 + b_piel**2)
        median_chroma = np.median(chroma)
        p75_chroma = np.percentile(chroma, 75)
        
        # Varianza de L* (estabilidad de iluminación)
        varianza_l = np.var(l_piel)
        
        # Features de cabello (si disponible)
        l_cabello = None
        contraste = None
        if lab_cabello is not None and len(lab_cabello) > 0:
            l_cabello = np.median(lab_cabello[:, 0])
            contraste = abs(median_l - l_cabello)
        
        # Clasificar subtono
        # Cool: b* bajo o negativo + a* moderado/bajo
        # Warm: b* alto (amarillo) y a* moderado
        # Neutral: valores intermedios con varianza baja
        
        subtono_categoria = self._clasificar_subtono(median_a, median_b)
        
        # Clasificar contraste
        contraste_categoria = self._clasificar_contraste(contraste) if contraste is not None else "desconocido"
        
        # Clasificar chroma
        chroma_categoria = self._clasificar_chroma(median_chroma)
        
        return {
            # Raw values (LAB)
            "median_a": float(median_a),
            "median_b": float(median_b),
            "median_l": float(median_l),
            "median_chroma": float(median_chroma),
            "p75_chroma": float(p75_chroma),
            "varianza_l": float(varianza_l),
            "l_cabello": float(l_cabello) if l_cabello is not None else None,
            "contraste_absoluto": float(contraste) if contraste is not None else None,
            
            # Categorías
            "subtono": subtono_categoria,
            "contraste": contraste_categoria,
            "chroma": chroma_categoria,
            
            # Metadata
            "n_pixeles_piel": len(lab_piel),
            "n_pixeles_cabello": len(lab_cabello) if lab_cabello is not None else 0
        }
    
    def _clasificar_subtono(self, median_a: float, median_b: float) -> str:
        """Cool / warm / neutral según medianas a* y b* en LAB."""
        # Cool: b* bajo/negativo, a* no muy alto
        # Warm: b* alto (amarillo), a* moderado
        if median_b < -5 and median_a < 10:
            return "cool"
        elif median_b > 8 and median_a > -5 and median_a < 15:
            return "warm"
        elif -5 <= median_b <= 8 and -5 <= median_a <= 15:
            return "neutral"
        else:
            # Casos borderline: priorizar b*
            if median_b > 5:
                return "warm"
            elif median_b < -3:
                return "cool"
            else:
                return "neutral"
    
    def _clasificar_contraste(self, contraste_absoluto: float) -> str:
        """Bajo (<30), medio (30-60) o alto (>60) según diferencia de L*."""
        if contraste_absoluto < 30:
            return "bajo"
        elif contraste_absoluto < 60:
            return "medio"
        else:
            return "alto"
    
    def _clasificar_chroma(self, median_chroma: float) -> str:
        """Suave (<15), medio (15-25) o intenso (>25)."""
        if median_chroma < 15:
            return "suave"
        elif median_chroma < 25:
            return "medio"
        else:
            return "intenso"
