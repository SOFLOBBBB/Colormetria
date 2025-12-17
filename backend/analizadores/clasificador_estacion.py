"""
Clasificador de estación de color (Primavera, Verano, Otoño, Invierno)
Usa análisis LAB y sistema de puntuación con softmax
"""

from typing import Dict, Any, Tuple
import numpy as np
import cv2


class ClasificadorEstacion:
    """
    Clasificador de estación de color con alta precisión.
    
    Mejoras:
    1. Análisis en espacio de color LAB para subtono preciso
    2. Puntuación con penalizaciones fuertes para incompatibilidades
    3. Normalización softmax para mejor diferenciación
    4. Cálculo de confianza basado en margen de victoria
    """
    
    def __init__(self):
        """Inicializa el clasificador"""
        self.info_estaciones = {
            "primavera": {
                "nombre": "Primavera",
                "emoji": "🌸",
                "descripcion": "Tu colorimetría indica tonos cálidos y luminosos. Los colores vivos y frescos como coral, durazno y turquesa resaltan tu belleza natural.",
                "caracteristicas": [
                    "Subtono de piel cálido con matices dorados",
                    "Colores naturales brillantes y vibrantes",
                    "Contraste suave a medio entre tus rasgos",
                    "Los colores de primavera iluminan tu rostro"
                ]
            },
            "verano": {
                "nombre": "Verano",
                "emoji": "🌊",
                "descripcion": "Tu colorimetría indica tonos fríos y suaves. Los colores apagados y elegantes como lavanda, rosa pastel y azul polvo te favorecen.",
                "caracteristicas": [
                    "Subtono de piel frío con matices rosados",
                    "Colores naturales suaves y delicados",
                    "Bajo contraste entre tus rasgos",
                    "Los tonos empolvados armonizan con tu piel"
                ]
            },
            "otono": {
                "nombre": "Otoño",
                "emoji": "🍂",
                "descripcion": "Tu colorimetría indica tonos cálidos y profundos. Los colores terrosos y ricos como terracota, mostaza y verde oliva resaltan tu calidez.",
                "caracteristicas": [
                    "Subtono de piel cálido con matices dorados intensos",
                    "Colores naturales ricos y profundos",
                    "Contraste medio a alto entre tus rasgos",
                    "Los tonos tierra complementan tu coloración"
                ]
            },
            "invierno": {
                "nombre": "Invierno",
                "emoji": "❄️",
                "descripcion": "Tu colorimetría indica tonos fríos e intensos. Los colores puros y dramáticos como negro, blanco, rojo cereza y azul royal te favorecen.",
                "caracteristicas": [
                    "Subtono de piel frío con matices azulados o neutros",
                    "Alto contraste entre piel, ojos y cabello",
                    "Colores naturales intensos y definidos",
                    "Los colores puros y brillantes resaltan tu dramatismo"
                ]
            }
        }
    
    def clasificar(self, colores: Dict[str, Any]) -> Dict[str, Any]:
        """
        Clasifica la estación con alta precisión.
        """
        # Extraer datos
        subtono = colores.get("subtono", "neutro")
        contraste = colores.get("contraste", "medio")
        
        piel = colores.get("piel", {})
        cabello = colores.get("cabello", {})
        ojos = colores.get("ojos", {})
        
        rgb_piel = piel.get("rgb", [150, 130, 110])
        rgb_cabello = cabello.get("rgb", [80, 60, 40])
        rgb_ojos = ojos.get("rgb", [100, 80, 60])
        
        luminosidad_piel = piel.get("luminosidad", "media")
        categoria_cabello = cabello.get("categoria", "medio")
        categoria_ojos = ojos.get("categoria", "medio")
        
        # Análisis adicional de color
        analisis_lab = self._analizar_colores_lab(rgb_piel, rgb_cabello, rgb_ojos)
        
        # Calcular puntajes base
        puntajes_base = {
            "primavera": self._puntaje_primavera(
                subtono, contraste, luminosidad_piel, 
                categoria_cabello, categoria_ojos, 
                rgb_piel, analisis_lab
            ),
            "verano": self._puntaje_verano(
                subtono, contraste, luminosidad_piel,
                categoria_cabello, categoria_ojos,
                rgb_piel, analisis_lab
            ),
            "otono": self._puntaje_otono(
                subtono, contraste, luminosidad_piel,
                categoria_cabello, categoria_ojos,
                rgb_piel, rgb_cabello, analisis_lab
            ),
            "invierno": self._puntaje_invierno(
                subtono, contraste, luminosidad_piel,
                categoria_cabello, categoria_ojos,
                rgb_piel, rgb_cabello, analisis_lab
            )
        }
        
        # Aplicar softmax con temperatura para mejor diferenciación
        probabilidades = self._softmax_con_temperatura(puntajes_base, temperatura=0.5)
        
        # Encontrar ganador
        estacion_ganadora = max(probabilidades, key=probabilidades.get)
        prob_ganadora = probabilidades[estacion_ganadora]
        
        # Calcular confianza basada en margen de victoria
        probs_ordenadas = sorted(probabilidades.values(), reverse=True)
        margen = probs_ordenadas[0] - probs_ordenadas[1] if len(probs_ordenadas) > 1 else probs_ordenadas[0]
        
        # La confianza aumenta con el margen
        # Si el ganador tiene 40% más que el segundo, confianza alta
        confianza = min(95, prob_ganadora + (margen * 1.5))
        confianza = max(30, confianza)  # Mínimo 30%
        
        # Segunda opción
        probs_ordenadas_dict = sorted(probabilidades.items(), key=lambda x: x[1], reverse=True)
        segunda_opcion = probs_ordenadas_dict[1] if len(probs_ordenadas_dict) > 1 else None
        
        # Construir respuesta
        info = self.info_estaciones[estacion_ganadora].copy()
        info["id"] = estacion_ganadora
        info["confianza"] = round(confianza, 1)
        info["probabilidades"] = {k: round(v, 1) for k, v in probabilidades.items()}
        
        if segunda_opcion and segunda_opcion[1] > 15:
            info["segunda_opcion"] = {
                "id": segunda_opcion[0],
                "nombre": self.info_estaciones[segunda_opcion[0]]["nombre"],
                "probabilidad": round(segunda_opcion[1], 1)
            }
        
        return info
    
    def _analizar_colores_lab(
        self, 
        rgb_piel: list, 
        rgb_cabello: list, 
        rgb_ojos: list
    ) -> Dict[str, Any]:
        """
        Analiza colores en espacio LAB para clasificación precisa.
        """
        def rgb_to_lab(rgb):
            rgb_array = np.uint8([[rgb]])
            lab = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2LAB)[0][0]
            return {
                "L": float(lab[0]),  # Luminosidad (0-255)
                "a": float(lab[1]) - 128,  # Verde(-) a Rojo(+)
                "b": float(lab[2]) - 128   # Azul(-) a Amarillo(+)
            }
        
        lab_piel = rgb_to_lab(rgb_piel)
        lab_cabello = rgb_to_lab(rgb_cabello)
        lab_ojos = rgb_to_lab(rgb_ojos)
        
        # Calcular índices de calidez
        # b positivo = más amarillo = más cálido
        # a positivo = más rojo/rosa
        indice_calidez_piel = lab_piel["b"] - (lab_piel["a"] * 0.3)
        
        # Calcular saturación de color
        saturacion_piel = np.sqrt(lab_piel["a"]**2 + lab_piel["b"]**2)
        
        # Calcular contraste LAB
        delta_L_cabello = abs(lab_piel["L"] - lab_cabello["L"])
        delta_L_ojos = abs(lab_piel["L"] - lab_ojos["L"])
        contraste_lab = (delta_L_cabello + delta_L_ojos) / 2
        
        return {
            "lab_piel": lab_piel,
            "lab_cabello": lab_cabello,
            "indice_calidez": indice_calidez_piel,
            "saturacion": saturacion_piel,
            "contraste_lab": contraste_lab,
            "es_calido": indice_calidez_piel > 5,
            "es_frio": indice_calidez_piel < -3,
            "es_neutro": -3 <= indice_calidez_piel <= 5,
            "alto_contraste": contraste_lab > 60,
            "bajo_contraste": contraste_lab < 35
        }
    
    def _softmax_con_temperatura(
        self, 
        puntajes: Dict[str, float], 
        temperatura: float = 1.0
    ) -> Dict[str, float]:
        """
        Aplica softmax con temperatura para convertir puntajes en probabilidades.
        
        Temperatura baja (< 1) = más diferenciación
        Temperatura alta (> 1) = más suave
        """
        # Normalizar puntajes primero (evitar negativos)
        min_puntaje = min(puntajes.values())
        puntajes_norm = {k: v - min_puntaje + 0.1 for k, v in puntajes.items()}
        
        # Aplicar temperatura
        puntajes_temp = {k: v / temperatura for k, v in puntajes_norm.items()}
        
        # Softmax
        max_puntaje = max(puntajes_temp.values())
        exp_puntajes = {k: np.exp(v - max_puntaje) for k, v in puntajes_temp.items()}
        suma = sum(exp_puntajes.values())
        
        return {k: (v / suma) * 100 for k, v in exp_puntajes.items()}
    
    def _puntaje_primavera(
        self, subtono, contraste, luminosidad_piel,
        categoria_cabello, categoria_ojos, rgb_piel, analisis
    ) -> float:
        """
        Primavera = Cálido + Luminoso + Bajo contraste
        Características: Piel dorada clara, colores vibrantes
        """
        puntaje = 0.0
        r, g, b = rgb_piel
        
        # === SUBTONO (peso alto) ===
        if analisis["es_calido"]:
            puntaje += 8.0
        elif analisis["es_neutro"]:
            puntaje += 2.0
        else:  # es_frio
            puntaje -= 6.0  # Penalización fuerte
        
        # === CONTRASTE ===
        if analisis["bajo_contraste"]:
            puntaje += 5.0
        elif not analisis["alto_contraste"]:
            puntaje += 2.0
        else:
            puntaje -= 3.0  # Alto contraste no es Primavera
        
        # === LUMINOSIDAD ===
        if luminosidad_piel in ["muy_clara", "clara"]:
            puntaje += 4.0
        elif luminosidad_piel == "media":
            puntaje += 1.0
        else:
            puntaje -= 2.0  # Piel oscura no es típica de Primavera
        
        # === CABELLO ===
        if categoria_cabello == "pelirrojo":
            puntaje += 6.0  # Muy característico
        elif categoria_cabello == "claro":
            puntaje += 3.0
        elif categoria_cabello in ["claro_cenizo", "medio_cenizo"]:
            puntaje -= 4.0  # Cenizo es Verano, no Primavera
        elif categoria_cabello == "oscuro":
            puntaje -= 2.0
        
        # === OJOS ===
        if categoria_ojos == "claro":
            puntaje += 2.0
        elif categoria_ojos == "medio":
            puntaje += 1.0
        
        # === ANÁLISIS RGB ADICIONAL ===
        # Primavera tiene piel claramente dorada
        diferencia_dorado = r - b
        if diferencia_dorado > 40:
            puntaje += 4.0
        elif diferencia_dorado > 25:
            puntaje += 2.0
        elif diferencia_dorado < 10:
            puntaje -= 3.0  # No es dorada
        
        return puntaje
    
    def _puntaje_verano(
        self, subtono, contraste, luminosidad_piel,
        categoria_cabello, categoria_ojos, rgb_piel, analisis
    ) -> float:
        """
        Verano = Frío + Suave + Bajo contraste
        Características: Piel rosada clara, colores apagados
        """
        puntaje = 0.0
        r, g, b = rgb_piel
        
        # === SUBTONO (peso alto) ===
        if analisis["es_frio"]:
            puntaje += 8.0
        elif analisis["es_neutro"]:
            puntaje += 4.0  # Neutro es común en Verano
        else:  # es_calido
            puntaje -= 5.0  # Penalización
        
        # === CONTRASTE ===
        if analisis["bajo_contraste"]:
            puntaje += 6.0  # Muy característico de Verano
        elif not analisis["alto_contraste"]:
            puntaje += 2.0
        else:
            puntaje -= 4.0  # Alto contraste no es Verano
        
        # === LUMINOSIDAD ===
        if luminosidad_piel in ["muy_clara", "clara"]:
            puntaje += 5.0  # Muy común en Verano
        elif luminosidad_piel == "media":
            puntaje += 2.0
        else:
            puntaje -= 2.0
        
        # === CABELLO ===
        if categoria_cabello in ["claro_cenizo", "medio_cenizo"]:
            puntaje += 7.0  # MUY característico de Verano
        elif categoria_cabello == "claro":
            puntaje += 3.0
        elif categoria_cabello == "medio":
            puntaje += 1.0
        elif categoria_cabello == "pelirrojo":
            puntaje -= 5.0  # Pelirrojo es Primavera/Otoño
        
        # === OJOS ===
        if categoria_ojos == "medio":
            puntaje += 3.0  # Común en Verano
        elif categoria_ojos == "claro":
            puntaje += 2.0
        
        # === ANÁLISIS RGB ===
        # Verano tiene poca diferencia r-b (no dorada)
        diferencia = r - b
        if diferencia < 20:
            puntaje += 4.0  # Tono frío/neutro
        elif diferencia < 35:
            puntaje += 1.0
        else:
            puntaje -= 3.0  # Muy dorada, no es Verano
        
        # Bonus por tono rosado
        if abs(r - b) < 25 and g < r:
            puntaje += 3.0
        
        return puntaje
    
    def _puntaje_otono(
        self, subtono, contraste, luminosidad_piel,
        categoria_cabello, categoria_ojos, rgb_piel, rgb_cabello, analisis
    ) -> float:
        """
        Otoño = Cálido + Profundo + Contraste medio/alto
        Características: Piel dorada intensa, colores tierra
        """
        puntaje = 0.0
        r, g, b = rgb_piel
        
        # === SUBTONO ===
        if analisis["es_calido"]:
            puntaje += 7.0
        elif analisis["es_neutro"]:
            puntaje += 2.0
        else:
            puntaje -= 5.0
        
        # === CONTRASTE ===
        if analisis["alto_contraste"]:
            puntaje += 3.0
        elif not analisis["bajo_contraste"]:
            puntaje += 4.0  # Contraste medio es ideal
        else:
            puntaje -= 2.0  # Bajo contraste no es típico
        
        # === LUMINOSIDAD ===
        if luminosidad_piel in ["media", "media_oscura"]:
            puntaje += 5.0  # Muy característico
        elif luminosidad_piel == "oscura":
            puntaje += 3.0
        elif luminosidad_piel == "clara":
            puntaje += 1.0
        else:  # muy_clara
            puntaje -= 2.0  # Muy clara no es típico de Otoño
        
        # === CABELLO ===
        if categoria_cabello == "pelirrojo":
            puntaje += 5.0
        elif categoria_cabello in ["medio", "oscuro"]:
            puntaje += 3.0
        elif categoria_cabello in ["claro_cenizo", "medio_cenizo"]:
            puntaje -= 4.0  # Cenizo es Verano
        
        # === OJOS ===
        if categoria_ojos in ["medio", "oscuro"]:
            puntaje += 3.0
        
        # === ANÁLISIS RGB ===
        # Otoño tiene piel muy cálida/dorada
        if r > g > b and (r - b) > 30:
            puntaje += 4.0
        
        # Saturación alta en piel
        if analisis["saturacion"] > 15:
            puntaje += 2.0
        
        return puntaje
    
    def _puntaje_invierno(
        self, subtono, contraste, luminosidad_piel,
        categoria_cabello, categoria_ojos, rgb_piel, rgb_cabello, analisis
    ) -> float:
        """
        Invierno = Frío + Intenso + Alto contraste
        Características: Piel fría clara u oscura, contraste dramático
        """
        puntaje = 0.0
        r, g, b = rgb_piel
        
        # === SUBTONO ===
        if analisis["es_frio"]:
            puntaje += 7.0
        elif analisis["es_neutro"]:
            puntaje += 2.0
        else:
            puntaje -= 5.0
        
        # === CONTRASTE (peso alto para Invierno) ===
        if analisis["alto_contraste"]:
            puntaje += 8.0  # MUY característico
        elif not analisis["bajo_contraste"]:
            puntaje += 2.0
        else:
            puntaje -= 5.0  # Bajo contraste no es Invierno
        
        # === LUMINOSIDAD (extremos) ===
        if luminosidad_piel in ["muy_clara", "oscura"]:
            puntaje += 4.0  # Extremos son característicos
        elif luminosidad_piel in ["clara", "media_oscura"]:
            puntaje += 2.0
        else:
            puntaje += 0.5
        
        # === CABELLO ===
        if categoria_cabello == "oscuro":
            puntaje += 5.0  # Muy característico
        elif categoria_cabello in ["claro_cenizo"]:
            # Podría ser platino
            rc, gc, bc = rgb_cabello
            if bc >= rc:  # Tono muy frío
                puntaje += 4.0
            else:
                puntaje += 1.0
        elif categoria_cabello == "pelirrojo":
            puntaje -= 4.0  # No es típico de Invierno
        
        # === OJOS ===
        if categoria_ojos == "oscuro":
            puntaje += 4.0  # Muy común
        elif categoria_ojos == "claro":
            # Ojos azules/grises intensos
            puntaje += 2.0
        
        # === ANÁLISIS RGB ===
        # Invierno: piel fría (b >= r o muy cercanos)
        if b >= r - 5:
            puntaje += 4.0
        elif b >= r - 15:
            puntaje += 2.0
        else:
            puntaje -= 2.0
        
        # Alto contraste LAB
        if analisis["contraste_lab"] > 70:
            puntaje += 3.0
        
        return puntaje
    
    def obtener_info_estacion(self, estacion_id: str) -> Dict[str, Any]:
        """Obtiene información de una estación específica"""
        return self.info_estaciones.get(estacion_id, self.info_estaciones["primavera"])
