"""Análisis de colores faciales (piel, ojos, cabello) con K-Means en regiones MediaPipe."""

import cv2
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from sklearn.cluster import KMeans
from collections import Counter


class AnalizadorColores:
    """Colores dominantes por región (mejillas, iris, cabello) y subtono en LAB."""

    def analizar(
        self,
        imagen: np.ndarray,
        landmarks: List[Tuple[int, int, float]],
        region_rostro: Dict[str, int],
        regiones: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        # Analizar color de piel usando mejillas y frente
        color_piel = self._analizar_piel_preciso(imagen, landmarks, regiones)
        
        # Analizar color de ojos usando iris si está disponible
        color_ojos = self._analizar_ojos_preciso(imagen, landmarks, regiones)
        
        # Analizar color de cabello
        color_cabello = self._analizar_cabello_preciso(imagen, region_rostro)
        
        # Determinar subtono con análisis LAB preciso
        subtono = self._analizar_subtono_lab(color_piel["rgb"])
        
        # Calcular contraste real
        contraste = self._calcular_contraste_real(
            color_piel["rgb"], 
            color_ojos["rgb"], 
            color_cabello["rgb"]
        )
        
        return {
            "piel": color_piel,
            "ojos": color_ojos,
            "cabello": color_cabello,
            "subtono": subtono,
            "contraste": contraste
        }
    
    def _analizar_piel_preciso(
        self,
        imagen: np.ndarray,
        landmarks: List[Tuple[int, int, float]],
        regiones: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Color dominante en mejillas/frente; K-Means y filtro de brillo."""
        pixeles_piel = []
        
        # Usar regiones pre-extraídas si están disponibles
        if regiones:
            for region_nombre in ["mejilla_izquierda", "mejilla_derecha", "frente"]:
                if region_nombre in regiones and regiones[region_nombre]["pixeles"] is not None:
                    pixeles = regiones[region_nombre]["pixeles"]
                    if len(pixeles) > 0:
                        pixeles_piel.extend(pixeles.tolist())
        
        # Si no hay suficientes píxeles, extraer manualmente
        if len(pixeles_piel) < 100:
            pixeles_piel = self._extraer_pixeles_piel_fallback(imagen, landmarks)
        
        if len(pixeles_piel) < 10:
            # Último recurso: usar centro del rostro
            altura, ancho = imagen.shape[:2]
            centro = imagen[altura//3:2*altura//3, ancho//3:2*ancho//3]
            pixeles_piel = centro.reshape(-1, 3).tolist()
        
        pixeles_array = np.array(pixeles_piel)
        
        # Filtrar píxeles anómalos (muy oscuros o muy claros)
        brillos = np.mean(pixeles_array, axis=1)
        mascara = (brillos > 40) & (brillos < 240)
        pixeles_filtrados = pixeles_array[mascara]
        
        if len(pixeles_filtrados) < 10:
            pixeles_filtrados = pixeles_array
        
        # K-Means++ para color dominante
        color_dominante = self._kmeans_color(pixeles_filtrados, n_clusters=3)
        
        # Calcular luminosidad
        luminosidad = self._calcular_luminosidad(color_dominante)
        
        return {
            "hex": self._rgb_a_hex(color_dominante),
            "rgb": color_dominante.tolist(),
            "nombre": self._clasificar_tono_piel(color_dominante, luminosidad),
            "luminosidad": self._categoria_luminosidad(luminosidad),
            "valor_l": round(luminosidad, 1)
        }
    
    def _analizar_ojos_preciso(
        self,
        imagen: np.ndarray,
        landmarks: List[Tuple[int, int, float]],
        regiones: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Color de iris/ojos; fallback a región ocular."""
        pixeles_ojos = []
        
        # Intentar usar iris detectado (más preciso)
        if regiones:
            for iris_nombre in ["iris_izquierdo", "iris_derecho"]:
                if iris_nombre in regiones and regiones[iris_nombre]["pixeles"] is not None:
                    pixeles = regiones[iris_nombre]["pixeles"]
                    if len(pixeles) > 0:
                        pixeles_ojos.extend(pixeles.tolist())
        
        # Si no hay iris, usar región de ojos
        if len(pixeles_ojos) < 20:
            if regiones:
                for ojo_nombre in ["ojo_izquierdo", "ojo_derecho"]:
                    if ojo_nombre in regiones and regiones[ojo_nombre]["pixeles"] is not None:
                        pixeles = regiones[ojo_nombre]["pixeles"]
                        if len(pixeles) > 0:
                            pixeles_ojos.extend(pixeles.tolist())
        
        # Fallback si no hay datos
        if len(pixeles_ojos) < 10:
            pixeles_ojos = self._extraer_pixeles_ojos_fallback(imagen, landmarks)
        
        pixeles_array = np.array(pixeles_ojos) if len(pixeles_ojos) > 0 else np.array([[100, 80, 60]])
        
        # Filtrar pupila (muy oscuro) y reflejos (muy claro)
        brillos = np.mean(pixeles_array, axis=1)
        mascara = (brillos > 20) & (brillos < 210)
        pixeles_filtrados = pixeles_array[mascara]
        
        if len(pixeles_filtrados) < 5:
            pixeles_filtrados = pixeles_array
        
        # K-Means para color de iris
        color_dominante = self._kmeans_color(pixeles_filtrados, n_clusters=2)
        
        return {
            "hex": self._rgb_a_hex(color_dominante),
            "rgb": color_dominante.tolist(),
            "nombre": self._clasificar_color_ojos(color_dominante),
            "categoria": self._categoria_ojos(color_dominante)
        }
    
    def _analizar_cabello_preciso(
        self,
        imagen: np.ndarray,
        region_rostro: Dict[str, int],
    ) -> Dict[str, Any]:
        """Color dominante en región superior y laterales (cabello)."""
        altura, ancho = imagen.shape[:2]
        x, y, w, h = region_rostro["x"], region_rostro["y"], region_rostro["ancho"], region_rostro["alto"]
        
        pixeles_cabello = []
        
        # Región 1: Encima de la frente
        y_top = max(0, y - int(h * 0.4))
        y_bottom = max(0, y - int(h * 0.05))
        x_left = max(0, x + int(w * 0.2))
        x_right = min(ancho, x + int(w * 0.8))
        
        if y_top < y_bottom and x_left < x_right:
            region_top = imagen[y_top:y_bottom, x_left:x_right]
            if region_top.size > 0:
                pixeles_cabello.extend(region_top.reshape(-1, 3).tolist())
        
        # Región 2: Lados de la cabeza
        for lado in ["izq", "der"]:
            if lado == "izq":
                lx1 = max(0, x - int(w * 0.3))
                lx2 = x + int(w * 0.1)
            else:
                lx1 = x + int(w * 0.9)
                lx2 = min(ancho, x + w + int(w * 0.3))
            
            ly1 = y
            ly2 = y + int(h * 0.4)
            
            if lx1 < lx2 and ly1 < ly2:
                region_lado = imagen[ly1:ly2, lx1:lx2]
                if region_lado.size > 0:
                    pixeles_cabello.extend(region_lado.reshape(-1, 3).tolist())
        
        if len(pixeles_cabello) < 50:
            # Usar esquinas superiores
            corner_size = min(50, altura // 8, ancho // 8)
            for region in [
                imagen[0:corner_size, 0:corner_size],
                imagen[0:corner_size, ancho-corner_size:ancho]
            ]:
                if region.size > 0:
                    pixeles_cabello.extend(region.reshape(-1, 3).tolist())
        
        pixeles_array = np.array(pixeles_cabello) if pixeles_cabello else np.array([[80, 60, 40]])
        
        # Filtrar fondo claro uniforme
        brillos = np.mean(pixeles_array, axis=1)
        mascara = brillos < 230  # Excluir fondo blanco
        pixeles_filtrados = pixeles_array[mascara]
        
        if len(pixeles_filtrados) < 20:
            pixeles_filtrados = pixeles_array
        
        # K-Means para color dominante
        color_dominante = self._kmeans_color(pixeles_filtrados, n_clusters=3)
        
        return {
            "hex": self._rgb_a_hex(color_dominante),
            "rgb": color_dominante.tolist(),
            "nombre": self._clasificar_color_cabello(color_dominante),
            "categoria": self._categoria_cabello(color_dominante)
        }
    
    def _extraer_pixeles_piel_fallback(
        self,
        imagen: np.ndarray,
        landmarks: List[Tuple[int, int, float]]
    ) -> List:
        """Extracción de respaldo para piel"""
        pixeles = []
        altura, ancho = imagen.shape[:2]
        
        # Índices de mejillas en MediaPipe
        indices_mejillas = [50, 101, 118, 119, 280, 330, 347, 348]
        
        for idx in indices_mejillas:
            if idx < len(landmarks):
                x, y = int(landmarks[idx][0]), int(landmarks[idx][1])
                for dy in range(-12, 13):
                    for dx in range(-12, 13):
                        if dx*dx + dy*dy <= 144:
                            ny, nx = y + dy, x + dx
                            if 0 <= ny < altura and 0 <= nx < ancho:
                                pixeles.append(imagen[ny, nx].tolist())
        
        return pixeles
    
    def _extraer_pixeles_ojos_fallback(
        self,
        imagen: np.ndarray,
        landmarks: List[Tuple[int, int, float]]
    ) -> List:
        """Extracción de respaldo para ojos"""
        pixeles = []
        altura, ancho = imagen.shape[:2]
        
        # Centros aproximados de ojos
        for idx in [468, 473, 159, 386]:  # Iris o centros de ojo
            if idx < len(landmarks):
                x, y = int(landmarks[idx][0]), int(landmarks[idx][1])
                for dy in range(-6, 7):
                    for dx in range(-6, 7):
                        if dx*dx + dy*dy <= 36:
                            ny, nx = y + dy, x + dx
                            if 0 <= ny < altura and 0 <= nx < ancho:
                                pixeles.append(imagen[ny, nx].tolist())
        
        return pixeles
    
    def _kmeans_color(self, pixeles: np.ndarray, n_clusters: int = 3) -> np.ndarray:
        """
        Encuentra el color dominante usando K-Means++.
        """
        if len(pixeles) == 0:
            return np.array([128, 128, 128])
        
        if len(pixeles) < n_clusters:
            return np.mean(pixeles, axis=0).astype(int)
        
        # K-Means++ para mejor inicialización
        kmeans = KMeans(
            n_clusters=min(n_clusters, len(pixeles)),
            init='k-means++',
            n_init=10,
            random_state=42
        )
        kmeans.fit(pixeles)
        
        # Obtener cluster más común
        conteos = Counter(kmeans.labels_)
        cluster_dominante = conteos.most_common(1)[0][0]
        
        return np.clip(kmeans.cluster_centers_[cluster_dominante], 0, 255).astype(int)
    
    def _analizar_subtono_lab(self, rgb: List[int]) -> str:
        """
        Analiza el subtono en espacio de color LAB con mayor precisión.
        
        LAB es ideal para análisis de piel porque:
        - L: Luminosidad
        - a: Verde(-) a Rojo(+) - valores altos = más rosado/frío
        - b: Azul(-) a Amarillo(+) - valores altos = más dorado/cálido
        
        MEJORADO: Mejor detección de subtonos fríos (Verano/Invierno)
        """
        rgb_array = np.uint8([[rgb]])
        lab = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2LAB)[0][0].astype(float)
        
        l, a, b = lab
        
        # Normalizar (LAB en OpenCV: L[0-255], a[0-255], b[0-255])
        a_norm = a - 128  # Centro en 0: negativo=verde, positivo=rojo/rosa
        b_norm = b - 128  # Centro en 0: negativo=azul, positivo=amarillo
        
        # Ratio de calidez mejorado
        # Ponderamos más el componente a (rosa) para detectar tonos fríos
        ratio_frio = a_norm * 0.6  # Componente rosado
        ratio_calido = b_norm * 0.8  # Componente amarillo/dorado
        
        indice_neto = ratio_calido - ratio_frio
        if indice_neto > 8:
            return "cálido"
        if indice_neto < 2:
            return "frío"
        return "neutro"
    
    def _calcular_contraste_real(
        self,
        rgb_piel: List[int],
        rgb_ojos: List[int],
        rgb_cabello: List[int]
    ) -> str:
        """
        Calcula el contraste basado en diferencias de luminosidad perceptual.
        """
        lum_piel = self._calcular_luminosidad(np.array(rgb_piel))
        lum_ojos = self._calcular_luminosidad(np.array(rgb_ojos))
        lum_cabello = self._calcular_luminosidad(np.array(rgb_cabello))
        
        # Diferencias
        d1 = abs(lum_piel - lum_cabello)
        d2 = abs(lum_piel - lum_ojos)
        d3 = abs(lum_ojos - lum_cabello)
        
        # Contraste máximo y promedio
        contraste_max = max(d1, d2, d3)
        contraste_avg = (d1 + d2 + d3) / 3
        
        # Usar combinación de ambos
        contraste = contraste_max * 0.6 + contraste_avg * 0.4
        
        if contraste > 90:
            return "alto"
        elif contraste > 45:
            return "medio"
        else:
            return "bajo"
    
    def _calcular_luminosidad(self, rgb: np.ndarray) -> float:
        """Luminosidad percibida (fórmula ITU-R BT.601)"""
        return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]
    
    def _categoria_luminosidad(self, lum: float) -> str:
        """Clasifica luminosidad en categorías"""
        if lum > 195:
            return "muy_clara"
        elif lum > 165:
            return "clara"
        elif lum > 125:
            return "media"
        elif lum > 85:
            return "media_oscura"
        else:
            return "oscura"
    
    def _rgb_a_hex(self, rgb: np.ndarray) -> str:
        """Convierte RGB a hexadecimal"""
        r, g, b = [int(np.clip(x, 0, 255)) for x in rgb[:3]]
        return f"#{r:02x}{g:02x}{b:02x}"
    
    def _clasificar_tono_piel(self, rgb: np.ndarray, lum: float) -> str:
        """Genera nombre descriptivo del tono de piel"""
        r, g, b = [int(x) for x in rgb]
        
        # Determinar temperatura
        if r > g + 15 and r > b + 15:
            temp = "dorado"
        elif b > r - 20 and b > g - 20:
            temp = "rosado"
        elif g > r - 10 and g > b - 10:
            temp = "oliva"
        else:
            temp = "neutro"
        
        # Combinar con luminosidad
        if lum > 195:
            base = "Porcelana"
        elif lum > 165:
            base = "Marfil"
        elif lum > 135:
            base = "Beige"
        elif lum > 100:
            base = "Canela"
        elif lum > 65:
            base = "Caramelo"
        else:
            base = "Ébano"
        
        return f"{base} {temp}"
    
    def _clasificar_color_ojos(self, rgb: np.ndarray) -> str:
        """Clasifica color de ojos basado en HSV"""
        rgb_array = np.uint8([[rgb]])
        hsv = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2HSV)[0][0]
        h, s, v = hsv
        
        lum = sum(rgb) / 3
        
        # Por saturación
        if s < 25:
            if v < 50:
                return "Negro"
            return "Gris"
        
        # Por tono (hue)
        if h < 15 or h > 165:
            if lum > 120:
                return "Miel"
            elif lum > 70:
                return "Avellana"
            return "Café oscuro"
        elif h < 25:
            return "Ámbar"
        elif h < 45:
            return "Verde avellana"
        elif h < 80:
            if s > 80:
                return "Verde esmeralda"
            return "Verde"
        elif h < 130:
            return "Verde azulado"
        elif h < 165:
            if v > 140:
                return "Azul claro"
            return "Azul"
        
        return "Café" if lum < 100 else "Café claro"
    
    def _categoria_ojos(self, rgb: np.ndarray) -> str:
        """Categoriza ojos por luminosidad"""
        lum = sum(rgb) / 3
        if lum > 130:
            return "claro"
        elif lum > 65:
            return "medio"
        return "oscuro"
    
    def _clasificar_color_cabello(self, rgb: np.ndarray) -> str:
        """Nombre de tono (cenizo/dorado) para cabello según RGB."""
        r, g, b = [int(x) for x in rgb]
        lum = (r + g + b) / 3
        
        # Calcular si es tono frío (cenizo) o cálido (dorado)
        diferencia_calido = r - b  # Positivo = cálido, negativo/bajo = frío
        es_cenizo = diferencia_calido < 20  # Poca diferencia = cenizo
        es_dorado = diferencia_calido > 35  # Mucha diferencia = dorado
        
        # Detectar pelirrojo
        if r > 90 and r > g * 1.3 and r > b * 1.4:
            if lum > 100:
                return "Cobrizo"
            return "Pelirrojo oscuro"
        
        # Clasificación por luminosidad + temperatura
        if lum > 175:
            if es_cenizo or b > r:
                return "Rubio platino"
            elif es_dorado:
                return "Rubio dorado claro"
            return "Rubio claro"
        elif lum > 145:
            if es_cenizo:
                return "Rubio cenizo"  # Típico de Verano
            elif es_dorado:
                return "Rubio dorado"  # Típico de Primavera
            return "Rubio medio"
        elif lum > 115:
            if es_cenizo:
                return "Castaño cenizo claro"
            elif es_dorado:
                return "Castaño dorado"
            return "Castaño claro"
        elif lum > 85:
            if es_cenizo:
                return "Castaño cenizo"
            elif r > b + 15:
                return "Castaño cálido"
            return "Castaño medio"
        elif lum > 55:
            if es_cenizo:
                return "Castaño oscuro cenizo"
            return "Castaño oscuro"
        elif lum > 35:
            return "Negro"
        return "Negro azabache"
    
    def _categoria_cabello(self, rgb: np.ndarray) -> str:
        """Categoría (claro_cenizo, medio, oscuro, etc.)."""
        r, g, b = [int(x) for x in rgb]
        lum = sum(rgb) / 3
        diferencia_calido = r - b
        
        # Pelirrojo
        if r > 90 and r > g * 1.3 and r > b * 1.4:
            return "pelirrojo"
        
        # Por luminosidad + temperatura
        if lum > 145:
            if diferencia_calido < 20:
                return "claro_cenizo"  # Verano
            return "claro"  # Podría ser Primavera
        elif lum > 85:
            if diferencia_calido < 15:
                return "medio_cenizo"  # Verano
            return "medio"
        return "oscuro"
