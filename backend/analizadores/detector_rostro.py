"""
Detector de rostro con MediaPipe Face Mesh (478 landmarks)
"""

import cv2
import numpy as np
import mediapipe as mp
from typing import Dict, Any, List, Tuple


class DetectorRostro:
    """
    Detector de rostro de alta precisión usando MediaPipe.
    
    Características:
    - 478 landmarks faciales (468 + 10 de iris)
    - Detección de iris para color de ojos preciso
    - Segmentación facial para regiones de piel
    - Determinación de forma de rostro basada en geometría real
    """
    
    def __init__(self):
        """Inicializa MediaPipe Face Mesh con máxima precisión"""
        self.mp_face_mesh = mp.solutions.face_mesh
        
        # Configuración de alta precisión
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,  # Incluye landmarks de iris
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # ========== ÍNDICES DE LANDMARKS MEDIAPIPE ==========
        # Estos son los índices REALES de MediaPipe Face Mesh
        
        # Contorno del rostro (óvalo facial)
        self.CONTORNO_ROSTRO = [
            10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
            397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
            172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
        ]
        
        # Mejilla izquierda (para color de piel)
        self.MEJILLA_IZQUIERDA = [36, 50, 101, 118, 119, 100, 126, 209, 49, 129]
        
        # Mejilla derecha (para color de piel)
        self.MEJILLA_DERECHA = [266, 280, 330, 347, 348, 329, 355, 429, 279, 358]
        
        # Frente
        self.FRENTE = [10, 67, 109, 108, 69, 104, 68, 71, 21, 54, 103, 67]
        
        # Ojo izquierdo - contorno
        self.OJO_IZQUIERDO = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
        
        # Ojo derecho - contorno
        self.OJO_DERECHO = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
        
        # Iris izquierdo (landmarks refinados 468-472)
        self.IRIS_IZQUIERDO = [468, 469, 470, 471, 472]
        
        # Iris derecho (landmarks refinados 473-477)
        self.IRIS_DERECHO = [473, 474, 475, 476, 477]
        
        # Labios
        self.LABIO_SUPERIOR = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78]
        self.LABIO_INFERIOR = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61]
        
        # Nariz
        self.NARIZ = [1, 2, 98, 327, 4, 5, 195, 197, 6, 168, 8, 9, 151, 10]
        
        # Cejas
        self.CEJA_IZQUIERDA = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]
        self.CEJA_DERECHA = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276]
        
        # Puntos clave para forma de rostro
        self.PUNTO_FRENTE = 10
        self.PUNTO_MENTON = 152
        self.PUNTO_POMULO_IZQ = 234
        self.PUNTO_POMULO_DER = 454
        self.PUNTO_MANDIBULA_IZQ = 172
        self.PUNTO_MANDIBULA_DER = 397
        
        print("✅ MediaPipe Face Mesh inicializado con 478 landmarks")
    
    def detectar(self, imagen: np.ndarray) -> Dict[str, Any]:
        """
        Detecta el rostro con precisión usando deep learning.
        
        Args:
            imagen: Array numpy de la imagen en formato RGB
            
        Returns:
            Diccionario con landmarks precisos y análisis de forma
        """
        altura, ancho = imagen.shape[:2]
        
        # Asegurar formato RGB
        if len(imagen.shape) == 2:
            imagen_rgb = cv2.cvtColor(imagen, cv2.COLOR_GRAY2RGB)
        elif imagen.shape[2] == 4:
            imagen_rgb = cv2.cvtColor(imagen, cv2.COLOR_RGBA2RGB)
        else:
            imagen_rgb = imagen
        
        # Procesar con MediaPipe
        resultados = self.face_mesh.process(imagen_rgb)
        
        if not resultados.multi_face_landmarks:
            return {
                "rostro_detectado": False,
                "mensaje": "No se detectó ningún rostro. Asegúrate de que la imagen tenga buena iluminación y el rostro sea visible."
            }
        
        # Obtener landmarks del primer rostro
        face_landmarks = resultados.multi_face_landmarks[0]
        
        # Convertir a coordenadas de píxeles
        landmarks = []
        for lm in face_landmarks.landmark:
            x = int(lm.x * ancho)
            y = int(lm.y * altura)
            z = lm.z  # Profundidad relativa
            landmarks.append((x, y, z))
        
        # Calcular bounding box del rostro
        puntos_contorno = [landmarks[i][:2] for i in self.CONTORNO_ROSTRO if i < len(landmarks)]
        xs = [p[0] for p in puntos_contorno]
        ys = [p[1] for p in puntos_contorno]
        
        margen = 20
        region_rostro = {
            "x": max(0, min(xs) - margen),
            "y": max(0, min(ys) - margen),
            "ancho": min(ancho, max(xs) + margen) - max(0, min(xs) - margen),
            "alto": min(altura, max(ys) + margen) - max(0, min(ys) - margen)
        }
        
        # Determinar forma del rostro con geometría precisa
        forma_rostro = self._determinar_forma_rostro_precisa(landmarks)
        
        # Extraer regiones para análisis de color
        regiones = self._extraer_regiones_precisas(landmarks, imagen)
        
        return {
            "rostro_detectado": True,
            "landmarks": landmarks,
            "num_landmarks": len(landmarks),
            "region_rostro": region_rostro,
            "forma_rostro": forma_rostro,
            "regiones": regiones,
            "tiene_iris": len(landmarks) >= 478
        }
    
    def _determinar_forma_rostro_precisa(self, landmarks: List[Tuple[int, int, float]]) -> str:
        """
        Determina la forma del rostro usando mediciones geométricas precisas.
        
        Mediciones:
        - Ancho de frente
        - Ancho de pómulos
        - Ancho de mandíbula
        - Largo del rostro
        """
        def distancia(p1, p2):
            return np.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)
        
        # Obtener puntos clave
        frente = landmarks[self.PUNTO_FRENTE]
        menton = landmarks[self.PUNTO_MENTON]
        pomulo_izq = landmarks[self.PUNTO_POMULO_IZQ]
        pomulo_der = landmarks[self.PUNTO_POMULO_DER]
        mandibula_izq = landmarks[self.PUNTO_MANDIBULA_IZQ]
        mandibula_der = landmarks[self.PUNTO_MANDIBULA_DER]
        
        # Calcular medidas
        largo_rostro = distancia(frente, menton)
        ancho_pomulos = distancia(pomulo_izq, pomulo_der)
        ancho_mandibula = distancia(mandibula_izq, mandibula_der)
        
        # Ancho de frente (usando puntos laterales de la frente)
        frente_izq = landmarks[21]
        frente_der = landmarks[251]
        ancho_frente = distancia(frente_izq, frente_der)
        
        if largo_rostro == 0:
            return "ovalado"
        
        # Proporciones
        ratio_largo_ancho = largo_rostro / ancho_pomulos if ancho_pomulos > 0 else 1
        ratio_pomulos_mandibula = ancho_pomulos / ancho_mandibula if ancho_mandibula > 0 else 1
        ratio_frente_mandibula = ancho_frente / ancho_mandibula if ancho_mandibula > 0 else 1
        
        # Clasificación basada en proporciones reales
        if ratio_largo_ancho > 1.5:
            return "alargado"
        elif ratio_largo_ancho < 1.1:
            if ratio_pomulos_mandibula < 1.1:
                return "cuadrado"
            else:
                return "redondo"
        else:
            # Proporciones medias
            if ratio_frente_mandibula > 1.15:
                return "corazon"
            elif ratio_pomulos_mandibula > 1.15:
                return "diamante"
            else:
                return "ovalado"
    
    def _extraer_regiones_precisas(
        self,
        landmarks: List[Tuple[int, int, float]],
        imagen: np.ndarray
    ) -> Dict[str, Any]:
        """
        Extrae regiones precisas para análisis de color usando landmarks reales.
        """
        altura, ancho = imagen.shape[:2]
        
        def obtener_pixeles_region(indices, radio=10):
            """Extrae píxeles alrededor de los landmarks especificados"""
            pixeles = []
            for idx in indices:
                if idx < len(landmarks):
                    x, y = landmarks[idx][0], landmarks[idx][1]
                    for dy in range(-radio, radio + 1):
                        for dx in range(-radio, radio + 1):
                            if dx*dx + dy*dy <= radio*radio:
                                ny, nx = y + dy, x + dx
                                if 0 <= ny < altura and 0 <= nx < ancho:
                                    pixeles.append(imagen[ny, nx])
            return np.array(pixeles) if pixeles else None
        
        def obtener_centro_region(indices):
            """Calcula el centro de una región"""
            puntos = [landmarks[i] for i in indices if i < len(landmarks)]
            if puntos:
                cx = sum(p[0] for p in puntos) // len(puntos)
                cy = sum(p[1] for p in puntos) // len(puntos)
                return (cx, cy)
            return None
        
        regiones = {
            "mejilla_izquierda": {
                "pixeles": obtener_pixeles_region(self.MEJILLA_IZQUIERDA, radio=15),
                "centro": obtener_centro_region(self.MEJILLA_IZQUIERDA)
            },
            "mejilla_derecha": {
                "pixeles": obtener_pixeles_region(self.MEJILLA_DERECHA, radio=15),
                "centro": obtener_centro_region(self.MEJILLA_DERECHA)
            },
            "frente": {
                "pixeles": obtener_pixeles_region(self.FRENTE, radio=12),
                "centro": obtener_centro_region(self.FRENTE)
            },
            "ojo_izquierdo": {
                "pixeles": obtener_pixeles_region(self.OJO_IZQUIERDO, radio=5),
                "centro": obtener_centro_region(self.OJO_IZQUIERDO)
            },
            "ojo_derecho": {
                "pixeles": obtener_pixeles_region(self.OJO_DERECHO, radio=5),
                "centro": obtener_centro_region(self.OJO_DERECHO)
            },
            "labios": {
                "pixeles": obtener_pixeles_region(self.LABIO_SUPERIOR + self.LABIO_INFERIOR, radio=5),
                "centro": obtener_centro_region(self.LABIO_SUPERIOR)
            }
        }
        
        # Agregar iris si están disponibles (landmarks 468-477)
        if len(landmarks) >= 478:
            regiones["iris_izquierdo"] = {
                "pixeles": obtener_pixeles_region(self.IRIS_IZQUIERDO, radio=4),
                "centro": obtener_centro_region(self.IRIS_IZQUIERDO)
            }
            regiones["iris_derecho"] = {
                "pixeles": obtener_pixeles_region(self.IRIS_DERECHO, radio=4),
                "centro": obtener_centro_region(self.IRIS_DERECHO)
            }
        
        return regiones
    
    def obtener_mascara_piel(
        self,
        landmarks: List[Tuple[int, int, float]],
        forma_imagen: Tuple[int, int]
    ) -> np.ndarray:
        """
        Crea una máscara de la región de piel del rostro.
        Útil para análisis preciso de color de piel.
        """
        altura, ancho = forma_imagen[:2]
        mascara = np.zeros((altura, ancho), dtype=np.uint8)
        
        # Crear polígono del contorno facial
        puntos_contorno = np.array([
            [landmarks[i][0], landmarks[i][1]] 
            for i in self.CONTORNO_ROSTRO 
            if i < len(landmarks)
        ], dtype=np.int32)
        
        if len(puntos_contorno) > 0:
            cv2.fillPoly(mascara, [puntos_contorno], 255)
        
        # Excluir ojos
        for indices_ojo in [self.OJO_IZQUIERDO, self.OJO_DERECHO]:
            puntos_ojo = np.array([
                [landmarks[i][0], landmarks[i][1]] 
                for i in indices_ojo 
                if i < len(landmarks)
            ], dtype=np.int32)
            if len(puntos_ojo) > 0:
                cv2.fillPoly(mascara, [puntos_ojo], 0)
        
        # Excluir labios
        puntos_labios = np.array([
            [landmarks[i][0], landmarks[i][1]] 
            for i in self.LABIO_SUPERIOR 
            if i < len(landmarks)
        ], dtype=np.int32)
        if len(puntos_labios) > 0:
            cv2.fillPoly(mascara, [puntos_labios], 0)
        
        # Excluir cejas
        for indices_ceja in [self.CEJA_IZQUIERDA, self.CEJA_DERECHA]:
            puntos_ceja = np.array([
                [landmarks[i][0], landmarks[i][1]] 
                for i in indices_ceja 
                if i < len(landmarks)
            ], dtype=np.int32)
            if len(puntos_ceja) > 0:
                cv2.fillPoly(mascara, [puntos_ceja], 0)
        
        return mascara
